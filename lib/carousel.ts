import { createClient } from "@/lib/supabase/client";
import { deleteFile, extractFilePathFromUrl, uploadFile } from "./database";

export interface CarouselImage {
  id: string;
  image_url: string;
  order: number;
  created_at: string;
}

const supabase = createClient();

// Função para testar a conexão com a tabela
export async function testCarouselTableConnection(): Promise<void> {
  console.log(
    "testCarouselTableConnection: Testando conexão com a tabela carousel_images..."
  );

  try {
    // Tentar fazer uma consulta simples
    const { data, error } = await supabase
      .from("carousel_images")
      .select("id")
      .limit(1);

    if (error) {
      console.error("testCarouselTableConnection: Erro na conexão:", error);
      throw error;
    }

    console.log(
      "testCarouselTableConnection: Conexão bem-sucedida. Resultado:",
      data
    );
  } catch (error) {
    console.error("testCarouselTableConnection: Falha na conexão:", error);
    throw error;
  }
}

export async function getCarouselImages(): Promise<CarouselImage[]> {
  console.log("getCarouselImages: Buscando imagens do carrossel...");
  const { data, error } = await supabase
    .from("carousel_images")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    console.error("getCarouselImages: Erro ao buscar imagens:", error);
    console.error("getCarouselImages: Detalhes do erro:", error.details);
    console.error("getCarouselImages: Mensagem:", error.message);
    throw error;
  }
  console.log("getCarouselImages: Imagens encontradas:", data);
  return data || [];
}

// Função para definir/sobrescrever a lista de imagens no banco de dados
export async function setCarouselImages(
  images: { image_url: string; order: number }[]
): Promise<CarouselImage[]> {
  console.log(
    "setCarouselImages: Iniciando processo com",
    images.length,
    "imagens"
  );
  console.log("setCarouselImages: Dados recebidos:", images);

  try {
    // First, get existing images to delete their files from storage
    const { data: existingImages, error: fetchError } = await supabase
      .from("carousel_images")
      .select("image_url");

    if (fetchError) {
      console.error(
        "setCarouselImages: Erro ao buscar imagens existentes:",
        fetchError
      );
    } else if (existingImages && existingImages.length > 0) {
      console.log(
        "setCarouselImages: Deletando",
        existingImages.length,
        "arquivos antigos do storage"
      );

      // Delete old files from storage
      for (const image of existingImages) {
        try {
          const filePath = extractFilePathFromUrl(image.image_url);
          if (filePath) {
            await deleteFile("galeria_imagens", filePath);
            console.log("✅ Arquivo antigo deletado do storage:", filePath);
          }
        } catch (storageError) {
          console.warn(
            "⚠️ Erro ao deletar arquivo antigo do storage:",
            storageError
          );
          // Continue with the process even if individual file deletion fails
        }
      }
    }

    // Delete all database records
    const { error: deleteError } = await supabase
      .from("carousel_images")
      .delete()
      .gte("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError) {
      console.error(
        "setCarouselImages: Erro ao deletar registros do banco:",
        deleteError
      );
      throw deleteError;
    }
    console.log(
      "setCarouselImages: Registros antigos deletados do banco com sucesso"
    );

    if (images.length === 0) {
      console.log(
        "setCarouselImages: Nenhuma imagem para inserir, retornando array vazio"
      );
      return [];
    }

    // Insert new images
    console.log("setCarouselImages: Inserindo", images.length, "novas imagens");
    const { data, error: insertError } = await supabase
      .from("carousel_images")
      .insert(images)
      .select();

    if (insertError) {
      console.error(
        "setCarouselImages: Erro ao inserir novas imagens:",
        insertError
      );
      console.error(
        "setCarouselImages: Detalhes do erro:",
        insertError.details
      );
      console.error("setCarouselImages: Mensagem:", insertError.message);
      throw insertError;
    }

    console.log("setCarouselImages: Imagens inseridas com sucesso:", data);
    return data || [];
  } catch (error) {
    console.error("setCarouselImages: Erro geral no processo:", error);
    throw error;
  }
}

// Função para fazer upload de um arquivo para o Supabase Storage
export async function uploadCarouselImage(
  file: File,
  path: string
): Promise<string> {
  try {
    console.log(
      "uploadCarouselImage: Fazendo upload para galeria_imagens:",
      path
    );
    const publicUrl = await uploadFile(file, "galeria_imagens", path);
    console.log("✅ Upload do carousel realizado com sucesso:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("❌ Erro no upload do arquivo do carousel:", error);
    throw error;
  }
}
