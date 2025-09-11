// Test script to verify student photo upload functionality
// Run this to ensure the fotos_alunos bucket exists in Supabase Storage

import { supabaseDatabase } from "../database";

export async function testStudentPhotoBucket() {
  try {
    // Try to list files in the bucket to verify it exists
    const { data, error } = await supabaseDatabase.storage
      .from("fotos_alunos")
      .list("", { limit: 1 });

    if (error) {
      console.error("❌ Error accessing fotos_alunos bucket:", error);
      console.log(
        "💡 You may need to create the 'fotos_alunos' bucket in Supabase Storage"
      );
      return false;
    }

    console.log("✅ fotos_alunos bucket is accessible");
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}
