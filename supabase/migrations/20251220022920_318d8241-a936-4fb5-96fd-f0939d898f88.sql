-- Add resource_type column to resources table for categorizing materials vs PYQ
ALTER TABLE public.resources
ADD COLUMN resource_type text NOT NULL DEFAULT 'material';

-- Add a comment explaining the resource types
COMMENT ON COLUMN public.resources.resource_type IS 'Type of resource: material (study materials) or pyq (past year questions)';