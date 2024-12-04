-- Function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(tbl text, col text) RETURNS boolean AS $$
DECLARE
  exists boolean;
BEGIN
  SELECT count(*) > 0 INTO exists
  FROM information_schema.columns
  WHERE table_name = tbl AND column_name = col;
  RETURN exists;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

-- Alter release_date column if it exists
DO $$
BEGIN
  IF column_exists('Release', 'release_date') THEN
    ALTER TABLE "Release" ALTER COLUMN "release_date" DROP NOT NULL;
  END IF;
END $$;
--> statement-breakpoint

-- Alter art column (always exists)
ALTER TABLE "Release" ALTER COLUMN "art" DROP NOT NULL;
--> statement-breakpoint

-- Drop the helper function
DROP FUNCTION column_exists(text, text);
--> statement-breakpoint
