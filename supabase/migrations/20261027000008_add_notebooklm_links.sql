-- Add shared Google NotebookLM URL columns to platform_settings for each KNEC project track
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS notebook_research_url text,
  ADD COLUMN IF NOT EXISTS notebook_fabrication_url text,
  ADD COLUMN IF NOT EXISTS notebook_business_url text;

-- Allow supervisors and admins to update platform_settings notebook URLs
DROP POLICY IF EXISTS "platform_settings_supervisor_update" ON public.platform_settings;
CREATE POLICY "platform_settings_supervisor_update"
ON public.platform_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin', 'supervisor')
  )
);
