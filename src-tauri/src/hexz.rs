//! Internalized hexz resource pack reader (from hexz_k).
//! Directly uses hexz-core + hexz-store for zero-overhead integration.

use serde::Deserialize;
use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;

mod deps {
    pub use hexz_core::algo::encryption::{AesGcmEncryptor, Encryptor};
    pub use hexz_core::format::header::Header;
    pub use hexz_core::format::magic::HEADER_SIZE;
    pub use hexz_core::store::StorageBackend;
    pub use hexz_core::ArchiveStream;
    pub use hexz_store;
}

pub struct ResourcePack {
    archive: Arc<hexz_core::Archive>,
    index: HashMap<String, (u64, usize)>,
}

#[derive(Debug, Deserialize)]
struct MetaFile { path: String, offset: u64, size: u64 }

#[derive(Debug, Deserialize)]
struct Metadata { files: Vec<MetaFile> }

impl ResourcePack {
    pub fn open(path: impl AsRef<Path>, password: Option<&str>) -> anyhow::Result<Self> {
        let path = path.as_ref();
        let archive = if let Some(pw) = password {
            let header = Self::read_header(path)?;
            if let Some(ref kp) = header.encryption {
                let enc: Box<dyn deps::Encryptor> = Box::new(
                    deps::AesGcmEncryptor::new(pw.as_bytes(), &kp.salt, kp.iterations)
                        .map_err(|e| anyhow::anyhow!("Key derivation failed: {e}"))?,
                );
                let a = deps::hexz_store::open_local(path, Some(enc))
                    .map_err(|e| anyhow::anyhow!("Failed to open encrypted archive: {e}"))?;
                let size = a.size(deps::ArchiveStream::Main);
                if size > 0 {
                    a.read_at(deps::ArchiveStream::Main, 0, 1)
                        .map_err(|_| anyhow::anyhow!("Wrong password or corrupted archive"))?;
                }
                a
            } else {
                deps::hexz_store::open_local(path, None::<Box<dyn deps::Encryptor>>)?
            }
        } else {
            deps::hexz_store::open_local(path, None::<Box<dyn deps::Encryptor>>)?
        };

        let index = Self::build_index(&archive)?;
        Ok(Self { archive, index })
    }

    pub fn read_file(&self, path: &str) -> anyhow::Result<Vec<u8>> {
        let normalized = path.replace('\\', "/");
        let (offset, size) = self.index.get(&normalized)
            .or_else(|| self.index.iter().find(|(k, _)| k.ends_with(&normalized)).map(|(_, v)| v))
            .ok_or_else(|| anyhow::anyhow!("File not found: {path}"))?;
        self.archive.read_at(deps::ArchiveStream::Main, *offset, *size).map_err(Into::into)
    }

    fn read_header(path: &Path) -> anyhow::Result<deps::Header> {
        let backend: Arc<dyn deps::StorageBackend> =
            Arc::new(deps::hexz_store::local::MmapBackend::new(path)?);
        let bytes = backend.read_exact(0, deps::HEADER_SIZE)?;
        Ok(bincode::deserialize(&bytes)?)
    }

    fn build_index(archive: &hexz_core::Archive) -> anyhow::Result<HashMap<String, (u64, usize)>> {
        let meta_bytes = archive.metadata.as_ref()
            .ok_or_else(|| anyhow::anyhow!("No metadata in archive"))?;
        let meta: Metadata = serde_json::from_slice(meta_bytes)?;
        let mut idx = HashMap::new();
        for f in &meta.files {
            idx.insert(f.path.replace('\\', "/"), (f.offset, f.size as usize));
        }
        Ok(idx)
    }
}
