# Setup Instructions for PDF Search App

## Prerequisites
- Supabase project connected to this application
- Environment variables configured (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)

## Database Setup

### Step 1: Run SQL Scripts

You need to run the SQL scripts in order to set up the database schema and storage buckets.

#### Option A: Using v0 (Recommended)
1. The SQL scripts are located in the `/scripts` folder
2. v0 can run these scripts directly for you
3. Scripts will be executed in order:
   - `001_create_altaratech_schema.sql` - Creates the database schema and tables
   - `002_create_storage_buckets.sql` - Creates storage buckets for files

#### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each script file in order:
   - First: `scripts/001_create_altaratech_schema.sql`
   - Second: `scripts/002_create_storage_buckets.sql`
4. Run each script

### Step 2: Verify Setup

After running the scripts, verify that:

1. **Schema Created**: The `altaratech` schema exists
2. **Tables Created**: 
   - `altaratech.input_files` table exists
   - `altaratech.output_files` table exists
3. **Storage Buckets Created**:
   - `input-pdfs` bucket exists
   - `output-documents` bucket exists

## How It Works

### File Upload Flow
1. User selects a PDF file and enters keywords
2. File is uploaded to Supabase Storage (`input-pdfs` bucket)
3. File metadata is saved to `altaratech.input_files` table
4. User can search for keywords in the PDF
5. Search results can be exported to a Word document
6. Generated Word document is saved to `output-documents` bucket
7. Output metadata is saved to `altaratech.output_files` table

### Database Schema

#### altaratech.input_files
- Stores uploaded PDF file metadata
- Contains file name, path, size, keywords
- Links to physical files in storage

#### altaratech.output_files
- Stores generated Word document metadata
- Links back to input PDF via `input_file_id`
- Contains search results and export information

### Storage Buckets

#### input-pdfs
- Stores uploaded PDF files
- Public read access
- Files organized in `pdfs/` folder with timestamp prefix

#### output-documents
- Stores generated Word documents
- Public read access
- Files organized with timestamp and unique identifiers

## Troubleshooting

### Error: "Failed to upload file to storage"
- Ensure the `input-pdfs` storage bucket exists
- Run `002_create_storage_buckets.sql` script
- Check storage policies allow inserts

### Error: "Failed to save file metadata to database"
- Ensure the `altaratech` schema and tables exist
- Run `001_create_altaratech_schema.sql` script
- Check RLS policies allow inserts

### Error: "Unexpected token 'R'"
- This usually means storage buckets don't exist
- Run the storage bucket creation script
- Verify buckets exist in Supabase dashboard
