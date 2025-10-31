-- Add INSERT policy for notifications so users can create notifications for others
CREATE POLICY "Users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);