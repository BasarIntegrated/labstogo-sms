-- Migration: 002_settings_schema (ROLLBACK)
-- Description: Rollback system settings table
-- Created: 2025-01-22
-- Author: System

-- Drop table
DROP TABLE IF EXISTS system_settings;
