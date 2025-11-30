import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const SUPABASE_URL = "https://fzpqjuqeorzpvdxlcwki.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHFqdXFlb3J6cHZkeGxjd2tpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTgyNzEsImV4cCI6MjA3ODg3NDI3MX0.OGrSfph5P4mzbHvbc1nvFZjS3pMtoqmBk_Ya6HPYkTQ";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cHFqdXFlb3J6cHZkeGxjd2tpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzI5ODI3MSwiZXhwIjoyMDc4ODc0MjcxfQ.4T6uPYa5u54-y9P82It7UKLFHu0gltvWh2u0MzLl6V0";

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);

async function testWithDifferentClients() {
  try {
    console.log("\n🔐 === TESTING WITH DIFFERENT CLIENTS ===\n");

    // Create test image
    const png1x1 = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x7b, 0x6b, 0x30, 0xca, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Test 1: With ANON_KEY
    console.log("1️⃣ Testing with ANON_KEY:");
    const fileName1 = `promos/test-anon-${Date.now()}.png`;
    const { error: anonError } = await supabaseAnon.storage
      .from("promotions-images")
      .upload(fileName1, png1x1, { contentType: "image/png" });

    if (anonError) {
      console.log(`   ❌ FAILED: ${anonError.message}`);
    } else {
      console.log(`   ✅ SUCCESS`);
    }

    // Test 2: With SERVICE_ROLE_KEY
    console.log("\n2️⃣ Testing with SERVICE_ROLE_KEY:");
    const fileName2 = `promos/test-service-${Date.now()}.png`;
    const { error: serviceError } = await supabaseAdmin.storage
      .from("promotions-images")
      .upload(fileName2, png1x1, { contentType: "image/png" });

    if (serviceError) {
      console.log(`   ❌ FAILED: ${serviceError.message}`);
      console.log(`   Status: ${(serviceError as any).status}`);
    } else {
      console.log(`   ✅ SUCCESS`);
    }

    // Test 3: Check policies
    console.log("\n3️⃣ Checking RLS policies in database:");
    const { data: policies, error: policiesError } =
      await supabaseAdmin.rpc("get_storage_policies");

    if (policiesError) {
      console.log(`   ℹ️ Cannot query policies directly`);
      console.log(`   Next: Go to Supabase Dashboard and manually create policies`);
    } else {
      console.log(`   ✅ Policies found`);
    }

    console.log(
      "\n📋 RECOMMENDATIONS:\n" +
        "   If both failed: RLS policies need to be fixed\n" +
        "   Run: FIX_SERVICE_ROLE_RLS.sql in Supabase SQL Editor\n"
    );
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

testWithDifferentClients();
