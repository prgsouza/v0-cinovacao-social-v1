// Test function to verify "fotos_mulheres" bucket access
import { supabaseDatabase } from "../database";

export async function testWomanPhotoBucket(): Promise<boolean> {
  try {
    // Test if we can access the bucket
    const { data, error } = await supabaseDatabase.storage
      .from("fotos_mulheres")
      .list("", { limit: 1 });

    if (error) {
      console.error("Bucket test failed:", error);
      return false;
    }

    console.log("✅ fotos_mulheres bucket is accessible");
    return true;
  } catch (error) {
    console.error("❌ fotos_mulheres bucket test error:", error);
    return false;
  }
}
