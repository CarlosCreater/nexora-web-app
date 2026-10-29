"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string | null;
  imagem_url: string | null;
  ativo: boolean;
};

export default function ProdutosAdmin() {
  const router = useRouter();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [previaImagem, setPreviaImagem] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function iniciar() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/admin");
        return;
      }

      const { error: erroAcesso } = await supabase
        .from("produtos")
        .select("id")
        .limit(1);

      if (erroAcesso) {
        await supabase.auth.signOut();
        router.replace("/admin");
        return;
      }

      setVerificandoAcesso(false);
      await carregarProdutos();
    }

    iniciar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function carregarProdutos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar produtos: " + error.message);
    } else {
      setProdutos((data ?? []) as Produto[]);
    }

    setCarregando(false);
  }

  function selecionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0] ?? null;
    setMensagem("");

    if (!arquivo) {
      setArquivoImagem(null);
      setPreviaImagem("");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setMensagem("Escolha uma imagem JPG, PNG ou WebP.");
      e.target.value = "";
      setArquivoImagem(null);
      setPreviaImagem("");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setMensagem("A imagem deve ter no máximo 5 MB.");
      e.target.value = "";
      setArquivoImagem(null);
      setPreviaImagem("");
      return;
    }

    setArquivoImagem(arquivo);
    setPreviaImagem(URL.createObjectURL(arquivo));
  }

  async function cadastrarProduto(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMensagem("");

    const precoNumerico = Number(preco.replace(",", "."));

    if (
      !nome.trim() ||
      !preco.trim() ||
      !Number.isFinite(precoNumerico) ||
      precoNumerico < 0
    ) {
      setMensagem("Informe um nome e um preço válido.");
      return;
    }

    setSalvando(true);

    let caminhoImagem: string | null = null;

    try {
      let imagemUrl: string | null = null;

      if (arquivoImagem) {
        const extensao =
          arquivoImagem.name.split(".").pop()?.toLowerCase() || "jpg";
        const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;

        const { error: erroUpload } = await supabase.storage
          .from("produtos")
          .upload(nomeArquivo, arquivoImagem, {
            contentType: arquivoImagem.type,
            upsert: false,
          });

        if (erroUpload) {
          throw new Error("Erro ao enviar imagem: " + erroUpload.message);
        }

        caminhoImagem = nomeArquivo;

        const { data } = supabase.storage
          .from("produtos")
          .getPublicUrl(nomeArquivo);

        imagemUrl = data.publicUrl;
      }

      const { error } = await supabase.from("produtos").insert({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        preco: precoNumerico,
        categoria: categoria.trim() || null,
        imagem_url: imagemUrl,
        ativo,
      });

      if (error) {
        if (caminhoImagem) {
          await supabase.storage.from("produtos").remove([caminhoImagem]);
        }

        throw new Error("Erro ao cadastrar produto: " + error.message);
      }

      setMensagem("Produto cadastrado com sucesso!");
      setNome("");
      setDescricao("");
      setPreco("");
      setCategoria("");
      setArquivoImagem(null);
      setPreviaImagem("");
      setAtivo(true);

      const campoArquivo = document.getElementById(
        "imagem-produto"
      ) as HTMLInputElement | null;

      if (campoArquivo) campoArquivo.value = "";

      await carregarProdutos();
    } catch (erro) {
      setMensagem(
        erro instanceof Error ? erro.message : "Ocorreu um erro inesperado."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Deseja excluir o produto "${produto.nome}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    setExcluindo(produto.id);
    setMensagem("");

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", produto.id);

    if (error) {
      setMensagem("Erro ao excluir produto: " + error.message);
    } else {
      setProdutos((atuais) =>
        atuais.filter((item) => item.id !== produto.id)
      );
      setMensagem("Produto excluído com sucesso!");
    }

    setExcluindo(null);
  }

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin");
  }

  if (verificandoAcesso) {
    return <p className="p-6">Verificando acesso...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">PORMIM.</h1>
            <p className="mt-2 text-gray-600">Painel administrativo</p>
          </div>

          <button
            onClick={sair}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2"
          >
            Sair
          </button>
        </header>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">Cadastrar produto</h2>

          <form onSubmit={cadastrarProduto} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nome do produto *
              </label>
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Camiseta Oversized"
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Detalhes do produto"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Preço em reais *
                </label>
                <input
                  required
                  inputMode="decimal"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="89,90"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Categoria
                </label>
                <input
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex.: Camiseta"
                  className="w-full rounded-lg border border-gray-300 bg-white p-3"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="imagem-produto"
                className="mb-1 block text-sm font-medium"
              >
                Foto do produto
              </label>

              <input
                id="imagem-produto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selecionarImagem}
                className="w-full rounded-lg border border-gray-300 bg-white p-3"
              />

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG ou WebP. Máximo de 5 MB.
              </p>

              {previaImagem && (
                <img
                  src={previaImagem}
                  alt="Prévia do produto"
                  className="mt-4 h-64 w-52 rounded-lg border object-cover"
                />
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
              />
              Produto ativo na loja
            </label>

            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Cadastrar produto"}
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Produtos cadastrados ({produtos.length})
          </h2>

          {mensagem && (
            <p role="status" className="mb-4 text-sm">
              {mensagem}
            </p>
          )}

          {carregando && <p>Carregando produtos...</p>}

          {!carregando && produtos.length === 0 && (
            <p className="text-gray-600">Nenhum produto cadastrado.</p>
          )}

          <div className="space-y-3">
            {produtos.map((produto) => (
              <article
                key={produto.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
              >
                {produto.imagem_url && (
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="h-24 w-20 rounded object-cover"
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold">{produto.nome}</h3>

                  <p>
                    R${" "}
                    {Number(produto.preco).toFixed(2).replace(".", ",")}
                  </p>

                  {produto.categoria && (
                    <p className="text-sm text-gray-500">
                      {produto.categoria}
                    </p>
                  )}

                  {produto.descricao && (
                    <p className="mt-1 text-sm text-gray-600">
                      {produto.descricao}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-gray-500">
                    {produto.ativo ? "Ativo" : "Inativo"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => excluirProduto(produto)}
                  disabled={excluindo !== null}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {excluindo === produto.id ? "Excluindo..." : "Excluir"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}