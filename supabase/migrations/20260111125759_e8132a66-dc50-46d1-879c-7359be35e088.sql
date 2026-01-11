-- Migration 1: Add 'student' role to app_role enum and add roll_number column
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'student';

-- Add roll_number column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS roll_number TEXT;