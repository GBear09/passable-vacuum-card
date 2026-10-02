# Changelog

All notable changes to **Passable Vacuum Card** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.8] - 2026-10-02

### Changed
- **Local LitElement Extraction**: Replaced external unpkg CDN imports with local Home Assistant prototype extraction (`hui-entities-card`), removing all external network dependencies.
- **Container Standardization**: Converted root element to `<ha-card class="container">` with `overflow: hidden;` for proper Lovelace theme inheritance and corner clipping.
- **Registry Metadata**: Standardized `window.customCards` configuration with `documentationURL`.

## [1.0.7] - 2026-09-23

### Fixed
- Room selection toggles and map camera live feed aspect ratio.

## [1.0.0] - 2026-09-12

### Added
- Initial release of Passable Vacuum Card.
