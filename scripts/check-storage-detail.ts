import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fzpqjuqeorzpvdxlcwki.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHFqdXFlb3J6cHZkeGxjd2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI5ODI3MSwiZXhwIjoyMDc4ODc0MjcxfQ.4T6uPYa5u54-y9P82It7UKLFHu0gltvWh2u0MzLl6V0";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkStorage() {
  try {
    console.log("\n📦 === CHECKING STORAGE BUCKETS ===\n");

    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError);
      return;
    }

    console.log(`✅ Found ${buckets.length} buckets:`);
    buckets.forEach((bucket) => {
      console.log(
        `   📦 ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`
      );
    });

    // Check specific bucket
    console.log("\n🔍 Checking 'promotions-images' bucket...");
    const promosBucket = buckets.find((b) => b.name === "promotions-images");

    if (!promosBucket) {
      console.error("❌ Bucket 'promotions-images' not found!");
      return;
    }

    console.log(`✅ Bucket found:`);
    console.log(`   Name: ${promosBucket.name}`);
    console.log(`   Public: ${promosBucket.public}`);
    console.log(`   Created: ${promosBucket.created_at}`);
    console.log(`   Updated: ${promosBucket.updated_at}`);

    // Try list files in bucket
    console.log("\n📂 Listing files in bucket...");
    const { data: files, error: listFilesError } = await supabase.storage
      .from("promotions-images")
      .list("promos/");

    if (listFilesError) {
      console.error("❌ Error listing files:", listFilesError.message);
      return;
    }

    if (files && files.length > 0) {
      console.log(`✅ Found ${files.length} files:`);
      files.slice(0, 5).forEach((f) => {
        console.log(`   - ${f.name} (${f.metadata?.size || 0} bytes)`);
      });
    } else {
      console.log("📭 Bucket is empty");
    }

    console.log("\n✅ Storage check complete\n");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

checkStorage();
