# API and Page Endpoints

This document lists the web pages and API endpoints exposed by the application, based on an analysis of the controller classes.

## 1. Kakao Integration (`KakaoLocalController`)

- **Base Path:** `/api/kakao`
- **Endpoints:**
    - `GET /coord2address`: Converts geographic coordinates to a street address.
        - **Query Params:** `longitude`, `latitude`
        - **Returns:** `JSON` with address details.
    - `GET /address2coord`: Converts a street address to geographic coordinates.
        - **Query Param:** `address`
        - **Returns:** `JSON` with coordinate details.
    - `GET /coord2region`: Converts geographic coordinates to an administrative region.
        - **Query Params:** `longitude`, `latitude`
        - **Returns:** `JSON` with region details.

## 2. Parking Usage Status (`PrkUsageStatusController`)

- **Base Path:** `/prk`
- **Endpoints:**
    - `GET /usage-status-list`: Renders the parking usage status list page.
        - **Returns:** `HTML` (JSP View: `prk/usage-status-list`)
    - `GET /api/usage-status/list`: API to fetch a list of parking usage records.
        - **Params (from `PrkUsageStatusVO`):** `prkBizMngNo`, `searchVehicleNo`, `searchLawCd`, etc.
        - **Returns:** `JSON` list of usage records.
    - `GET /api/usage-status/detail`: API to fetch details of a single usage record.
        - **Params (from `PrkUsageStatusVO`):** Unique ID for the record.
        - **Returns:** `JSON` object with record details.
    - `GET /api/usage-status/files`: API to fetch attached files for a usage record.
        - **Query Param:** `cmplSn`
        - **Returns:** `JSON` list of file metadata.
    - `POST /api/usage-status/save`: API to save a new parking usage record.
        - **Params:** Form data (`Map<String, String>`) and multipart files (`photos`).
        - **Returns:** `JSON` with success status and the ID of the new record.
    - `DELETE /api/usage-status/delete`: API to delete a usage record.
        - **Params (from `PrkUsageStatusVO`):** Unique ID for the record.
        - **Returns:** `JSON` with success status.

## 3. Parking Lot Management (`PrkDefPlceInfoController`)

- **Base Path:** `/prk`
- **Endpoints:**
    - **Page Rendering:**
        - `GET /parkinglist`: Renders the main parking lot list page.
            - **Returns:** `HTML` (JSP View: `prk/parking-list`)
        - `GET /onparking`, `GET /offparking`, `GET /buildparking`: Render pages for creating new on-street, off-street, or building-attached parking lots.
            - **Returns:** `HTML` (JSP Views)
        - `GET /onparking-detail`, `GET /offparking-detail`, `GET /buildparking-detail`: Render detail pages for existing parking lots.
            - **Returns:** `HTML` (JSP Views)
    - **Data APIs:**
        - `GET /parking-data`: API to get a list of parking lots for the list view.
            - **Returns:** `JSON` list.
        - `GET /parking-map-data`: API to get parking lot data specifically for the map view.
            - **Returns:** `JSON` list with coordinates.
        - `POST /onparking-update`, `POST /offparking-update`, `POST /buildparking-update`: APIs to create or update parking lot details.
            - **Params:** `parkingData` (JSON) and `MultipartFile`s for various photos.
            - **Returns:** `JSON` with success status.
        - `POST /api/parking/update-status-pending`: API to change the status of multiple parking lots to "pending".
            - **Body:** `JSON` containing a `parkingList`.
            - **Returns:** `JSON` with success status.
    - **File/Photo APIs:**
        - `GET /parking-photos`: API to get metadata for all photos associated with a parking lot.
            - **Query Param:** `prkPlceInfoSn`
            - **Returns:** `JSON` list of photo metadata.
        - `GET /photo`: API to serve a specific parking lot image file.
            - **Query Params:** `prkPlceInfoSn`, `prkImgId`, `seqNo`
            - **Returns:** Image file (e.g., `image/jpeg`).
        - `GET /photo/usage`: API to serve an image file related to a usage record.
            - **Query Params:** `cmplSn`, `prkImgId`, `seqNo`
            - **Returns:** Image file.

## 4. Common Code API (`CoCodeController`)

- **Base Path:** `/cmm/codes`
- **Endpoints:**
    - `GET /sido`: API to get a list of provinces/metropolitan cities.
    - `GET /sigungu`: API to get a list of cities/counties based on a province code.
        - **Query Param:** `sidoCd`
    - `GET /emd`: API to get a list of towns/neighborhoods based on a city/county code.
        - **Query Param:** `sigunguCd`
    - `GET /parking-type`: API to get a list of parking type codes.
    - `GET /status`: API to get a list of progress status codes.
    - `GET /dynamic-groups`: API to get all code groups and their associated codes.

## 5. File Management (`FileUploadController`)

- **Base Path:** `/file`
- **Endpoints:**
    - `POST /upload`: API for single file upload.
    - `POST /upload-multiple`: API for multiple file uploads.
    - `GET /list`: API to list uploaded files for a given entity.
    - `DELETE /delete`: API to delete an uploaded file.
    - `GET /preview`: API to serve a preview of an uploaded image.

## 6. Authentication & Main Pages (`LoginController`, `IndexController`)

- **Endpoints:**
    - `GET /` or `GET /login`: Renders the login page.
        - **Returns:** `HTML` (JSP View: `cmm/ts_login`)
    - `POST /login`: Handles user authentication.
        - **Redirects:** To `/index` on success, or back to `/` on failure.
    - `GET /logout`: Invalidates the user session and logs them out.
        - **Redirects:** To `/`.
    - `GET /index`: Renders the main dashboard/index page.
        - **Returns:** `HTML` (JSP View: `cmm/index`)
    - `GET /gis/parkingmap`: Renders the map page for visualizing parking lots.
        - **Returns:** `HTML` (JSP View: `gis/parkingmap`)
