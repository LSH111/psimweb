# Database Schema Overview

This document provides a high-level overview of the database schema, inferred from the MyBatis mapper XML files. All tables appear to be under the `cpk` schema.

---

## 1. Parking Lot Tables

These tables define the core information about different types of parking lots.

### `tb_prk_def_plce_info`
The central table containing basic, universal information for all parking lots.

- **Primary Keys (Composite):** `prk_plce_manage_no`, `prk_plce_info_sn`
- **Purpose:** Stores the unique ID, name, type, and location (address, coordinates) of a parking lot.
- **Notable Columns:** `prk_plce_manage_no`, `prk_plce_info_sn`, `prk_plce_type`, `prkplce_nm`, `ldong_cd`, `zip`, `dtadd`, `prk_plce_lat`, `prk_plce_lon`.

### `tb_onstr_prklot_info` & `tb_onstr_prklot_oper_info`
- **Purpose:** Detailed and operational information for **on-street** parking lots (노상 주차장).
- **Relationship:** 1-to-1 with `tb_prk_def_plce_info`.
- **Notable Columns:** `tot_prk_cnt` (total spaces), `prk_oper_mthd_cd` (operation method), `wk_wkdy_oper_tm_cd` (weekday hours), fee-related columns (`wk_gn_1h_fee`, etc.).

### `tb_offstr_prklot_info` & `tb_offstr_prklot_oper_info`
- **Purpose:** Detailed and operational information for **off-street** parking lots (노외 주차장).
- **Relationship:** 1-to-1 with `tb_prk_def_plce_info`.
- **Notable Columns:** `tckt_mchn_yn` (ticketing machine yes/no), `barr_gte_yn` (barrier gate yes/no), `veh_rcgn_tp_cd` (vehicle recognition type).

### `tb_atch_prklot_info` & `tb_atch_prklot_oper_info`
- **Purpose:** Detailed and operational information for **attached (building)** parking lots (부설 주차장).
- **Relationship:** 1-to-1 with `tb_prk_def_plce_info`.
- **Notable Columns:** `prkplce_se` (ownership type), `prmisn_dt` (permission date), `plot_ar` (plot area), `myeon_ar` (total area).

---

## 2. Business & Status Tables

These tables link parking lots to surveys and track their status.

### `tb_prk_srvy_biz_info`
- **Purpose:** Stores information about a survey project/business.
- **Notable Columns:** `prk_biz_mng_no` (PK), `biz_nm`, `biz_yy` (business year), `use_yn`.

### `tb_biz_per_prklot_info`
- **Purpose:** A crucial junction table that links a parking lot (`prk_plce_manage_no`, `prk_plce_info_sn`) to a specific survey (`prk_biz_mng_no`). It also holds the progress status.
- **Notable Columns:** `prk_biz_mng_no`, `biz_per_prk_mng_no`, `prk_plce_manage_no`, `prk_plce_info_sn`, `prgs_sts_cd` (progress status code).

---

## 3. Usage Status & Files

These tables are for managing parking usage/violation reports and attached files.

### `tb_prklot_cmpl_info`
- **Purpose:** Records parking usage status instances (e.g., inspections, violations).
- **Notable Columns:** `cmpl_sn` (PK), `prk_biz_mng_no`, `examin_dd` (examination date), `vhcle_no` (vehicle number), `law_cd` (legality code), `plce_lat`, `plce_lon`.

### `tb_attch_pic_mng_info`
- **Purpose:** A polymorphic table for managing all attached photos and files. It can be linked to a parking lot OR a usage status record.
- **Link to Parking Lot:** via `prk_plce_info_sn`.
- **Link to Usage Status:** via `cmpl_sn`.
- **Notable Columns:** `prk_plce_info_sn`, `cmpl_sn`, `seq_no`, `prk_img_id` (image type, e.g., 'ON_MAIN'), `file_path`, `file_nm`, `real_file_nm`.

---

## 4. Common & User Tables

These are standard tables for users, codes, and administrative areas.

### `tb_co_user`
- **Purpose:** Stores user account information.
- **Notable Columns:** `user_id` (PK), `user_pw`, `user_nm`, `sigungu_cd`, `mbtlnum`.

### `tb_co_code`
- **Purpose:** A central repository for all common codes used throughout the application (e.g., statuses, types, categories).
- **Notable Columns:** `group_cd` (the category of code), `code_cd` (the code value), `code_nm` (the human-readable name).

### `tb_co_ldong`
- **Purpose:** Contains information about legal administrative districts (법정동).
- **Notable Columns:** `ldong_cd` (PK), `sido_cd`, `sigungu_cd`, `emd_cd`, `lgal_emd_nm`.
