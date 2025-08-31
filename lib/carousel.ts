import { createClient } from "@/lib/supabase/client"

export interface CarouselImage {
  id: string
  image_url: string
  order: number
  created_at: string
}

const supabase = createClient()

export async function getCarouselImages(): Promise<CarouselImage[]> {
  const { data, error } = await supabase
    .from("carousel_images")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    console.error("Erro ao buscar imagens do carrossel:", error);
    throw error;
  }
  return data || [];
}

// Função para definir/sobrescrever a lista de imagens no banco de dados
export async function setCarouselImages(images: { image_url: string; order: number }[]): Promise<CarouselImage[]> {
  const { error: deleteError } = await supabase.from("carousel_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.error("Erro ao deletar imagens antigas do carrossel:", deleteError);
    throw deleteError;
  }

  if (images.length === 0) {
    return [];
  }


  
  const { data, error: insertError } = await supabase
    .from("carousel_images")
    .insert(images)
    .select();
  
  if (insertError) {
    console.error("Erro ao inserir novas imagens do carrossel:", insertError);
    throw insertError;
  }
  return data || [];
}


// Função para fazer upload de um arquivo para o Supabase Storage
export async function uploadCarouselImage(
  file: File,
  path: string,
): Promise<string> {
  const bucket = "galeria_imagens"; // Bucket específico para a galeria
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  })
  
  if (error) {
    console.error("Erro no upload do arquivo:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path)

  return publicUrl
}