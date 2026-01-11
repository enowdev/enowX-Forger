use base64::{engine::general_purpose::STANDARD, Engine};
use ico::{IconDir, IconDirEntry, IconImage, ResourceType};
use image::{imageops::FilterType, DynamicImage, ImageFormat, ImageReader};
use std::fs::{self, File};
use std::io::{BufWriter, Cursor};
use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum IconError {
    #[error("Failed to decode image: {0}")]
    DecodeError(String),
    #[error("Failed to save image: {0}")]
    SaveError(String),
    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
    #[error("Image error: {0}")]
    ImageError(#[from] image::ImageError),
}

pub type Result<T> = std::result::Result<T, IconError>;

#[derive(Debug, Clone, serde::Deserialize)]
pub struct IconSize {
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub format: String,
}

#[derive(Debug, Clone, serde::Deserialize)]
pub struct GenerateRequest {
    pub image_data: String,
    pub output_path: String,
    pub icons: Vec<IconSize>,
    pub template_name: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct GenerateResult {
    pub success: bool,
    pub generated: Vec<String>,
    pub failed: Vec<FailedIcon>,
    pub output_path: String,
    pub template_name: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct FailedIcon {
    pub name: String,
    pub error: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ProgressEvent {
    pub template_name: String,
    pub current: usize,
    pub total: usize,
    pub current_icon: String,
}

/// Decode base64 image data to DynamicImage
pub fn decode_image(base64_data: &str) -> Result<DynamicImage> {
    let data = if base64_data.contains(',') {
        base64_data.split(',').nth(1).unwrap_or(base64_data)
    } else {
        base64_data
    };

    let bytes = STANDARD
        .decode(data)
        .map_err(|e| IconError::DecodeError(e.to_string()))?;

    let img = ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .map_err(|e| IconError::DecodeError(e.to_string()))?
        .decode()
        .map_err(|e| IconError::DecodeError(e.to_string()))?;

    Ok(img)
}

/// Resize image - use faster filter for speed
pub fn resize_image(img: &DynamicImage, width: u32, height: u32) -> DynamicImage {
    // Use CatmullRom for better speed/quality balance (Lanczos3 is slow)
    img.resize_exact(width, height, FilterType::CatmullRom)
}

/// Save image as PNG
pub fn save_png(img: &DynamicImage, path: &Path) -> Result<()> {
    img.save_with_format(path, ImageFormat::Png)?;
    Ok(())
}

/// Save image as WebP
pub fn save_webp(img: &DynamicImage, path: &Path) -> Result<()> {
    img.save_with_format(path, ImageFormat::WebP)?;
    Ok(())
}

/// Save image as ICO (Windows icon format)
pub fn save_ico(img: &DynamicImage, path: &Path) -> Result<()> {
    let mut icon_dir = IconDir::new(ResourceType::Icon);
    // Only include common sizes for faster generation
    let sizes = [16, 32, 48, 256];

    for &size in &sizes {
        let resized = resize_image(img, size, size);
        let rgba = resized.to_rgba8();
        let icon_image = IconImage::from_rgba_data(size, size, rgba.into_raw());
        icon_dir.add_entry(IconDirEntry::encode(&icon_image)?);
    }

    let file = File::create(path)?;
    let writer = BufWriter::new(file);
    icon_dir.write(writer)?;

    Ok(())
}

/// Save image as ICNS (macOS icon format)
pub fn save_icns(img: &DynamicImage, path: &Path) -> Result<()> {
    let mut icon_family = icns::IconFamily::new();

    // Only essential sizes for faster generation
    let sizes = [
        (32, icns::IconType::RGBA32_32x32),
        (128, icns::IconType::RGBA32_128x128),
        (256, icns::IconType::RGBA32_256x256),
        (512, icns::IconType::RGBA32_512x512),
    ];

    for (size, icon_type) in sizes {
        let resized = resize_image(img, size, size);
        let rgba = resized.to_rgba8();
        
        let icns_image = icns::Image::from_data(
            icns::PixelFormat::RGBA,
            icon_type.pixel_width(),
            icon_type.pixel_height(),
            rgba.into_raw(),
        )
        .map_err(|e| IconError::SaveError(e.to_string()))?;

        icon_family
            .add_icon_with_type(&icns_image, icon_type)
            .map_err(|e| IconError::SaveError(e.to_string()))?;
    }

    let file = File::create(path)?;
    let writer = BufWriter::new(file);
    icon_family
        .write(writer)
        .map_err(|e| IconError::SaveError(e.to_string()))?;

    Ok(())
}

/// Generate icons with progress callback
pub fn generate_icons_with_progress<F>(request: &GenerateRequest, mut on_progress: F) -> GenerateResult 
where
    F: FnMut(ProgressEvent),
{
    let mut result = GenerateResult {
        success: true,
        generated: Vec::new(),
        failed: Vec::new(),
        output_path: request.output_path.clone(),
        template_name: request.template_name.clone(),
    };

    let total = request.icons.len();

    // Decode source image
    let source_img = match decode_image(&request.image_data) {
        Ok(img) => img,
        Err(e) => {
            result.success = false;
            result.failed.push(FailedIcon {
                name: "source".to_string(),
                error: e.to_string(),
            });
            return result;
        }
    };

    // Create output directory
    let output_dir = Path::new(&request.output_path).join(&request.template_name);
    if let Err(e) = fs::create_dir_all(&output_dir) {
        result.success = false;
        result.failed.push(FailedIcon {
            name: "output_dir".to_string(),
            error: e.to_string(),
        });
        return result;
    }

    // Generate each icon
    for (index, icon) in request.icons.iter().enumerate() {
        // Emit progress
        on_progress(ProgressEvent {
            template_name: request.template_name.clone(),
            current: index + 1,
            total,
            current_icon: icon.name.clone(),
        });

        let icon_path = output_dir.join(&icon.name);
        
        // Create subdirectories if needed
        if let Some(parent) = icon_path.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                result.failed.push(FailedIcon {
                    name: icon.name.clone(),
                    error: e.to_string(),
                });
                continue;
            }
        }

        let resized = resize_image(&source_img, icon.width, icon.height);
        
        let save_result = match icon.format.as_str() {
            "png" => save_png(&resized, &icon_path),
            "webp" => save_webp(&resized, &icon_path),
            "ico" => save_ico(&source_img, &icon_path),
            "icns" => save_icns(&source_img, &icon_path),
            "svg" => {
                result.failed.push(FailedIcon {
                    name: icon.name.clone(),
                    error: "SVG generation from raster not supported".to_string(),
                });
                continue;
            }
            _ => {
                result.failed.push(FailedIcon {
                    name: icon.name.clone(),
                    error: format!("Unsupported format: {}", icon.format),
                });
                continue;
            }
        };

        match save_result {
            Ok(_) => result.generated.push(icon.name.clone()),
            Err(e) => {
                result.failed.push(FailedIcon {
                    name: icon.name.clone(),
                    error: e.to_string(),
                });
            }
        }
    }

    result.success = result.failed.is_empty();
    result
}
