import { createClient } from "@/lib/supabase/client";

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

  // Primeiro, deletar todas as imagens existentes (usando .gte para deletar tudo)
  const { error: deleteError } = await supabase
    .from("carousel_images")
    .delete()
    .gte("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.error(
      "setCarouselImages: Erro ao deletar imagens antigas:",
      deleteError
    );
    throw deleteError;
  }
  console.log("setCarouselImages: Imagens antigas deletadas com sucesso");

  if (images.length === 0) {
    console.log(
      "setCarouselImages: Nenhuma imagem para inserir, retornando array vazio"
    );
    return [];
  }

  // Inserir as novas imagens
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
    console.error("setCarouselImages: Detalhes do erro:", insertError.details);
    console.error("setCarouselImages: Mensagem:", insertError.message);
    throw insertError;
  }

  console.log("setCarouselImages: Imagens inseridas com sucesso:", data);
  return data || [];
}

// Função para fazer upload de um arquivo para o Supabase Storage
export async function uploadCarouselImage(
  file: File,
  path: string
): Promise<string> {
  const bucket = "galeria_imagens"; // Bucket específico para a galeria
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Erro no upload do arquivo:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}
