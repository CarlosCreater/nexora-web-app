
"use client";

import { useEffect, useState } from "react";
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

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, descricao, preco, categoria, imagem_url, ativo")
        .eq("ativo", true)
        .order("created_at", { ascending: false });

      if (error) {
        setErro("Não foi possível carregar os produtos.");
      } else {
        setProdutos((data ?? []) as Produto[]);
      }

      setCarregando(false);
    }

    carregarProdutos();
  }, []);

  function simularPedido(produto: Produto) {
    alert(
      `Demonstração Carlo's\n\nProduto: ${produto.nome}\n` +
      `Preço: R$ ${Number(produto.preco).toFixed(2).replace(".", ",")}\n\n` +
      "Esta é uma simulação de compra para demonstração."
    );
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="bg-neutral-900 px-4 py-2 text-center text-xs tracking-widest text-white">
        ESTILO AUTÊNTICO. FEITO PARA VOCÊ.
      </div>

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 px-6 py-5 md:px-12">
        <a href="#inicio" className="text-2xl font-black tracking-widest">
          CARLO’S<span className="text-neutral-400">.</span>
        </a>

        <nav className="flex gap-5 text-sm">
          <a href="#inicio" className="hover:text-neutral-500">Início</a>
          <a href="#colecao" className="hover:text-neutral-500">Coleção</a>
          <a href="#sobre" className="hover:text-neutral-500">Sobre nós</a>
        </nav>

      </header>

      <section
        id="inicio"
        className="grid min-h-[520px] bg-neutral-100 md:grid-cols-2"
      >
        <div className="flex flex-col items-start justify-center px-8 py-16 md:px-16 lg:px-24">
          <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-neutral-500">
            NOVA IDENTIDADE. NOVA COLEÇÃO.
          </p>

          <h1 className="max-w-lg text-5xl font-black leading-[1.05] tracking-tight md:text-7xl">
            SEJA VOCÊ.
            <br />
            VISTA SUA
            <br />
            <span className="text-neutral-400">ESSÊNCIA.</span>
          </h1>

          <p className="mt-6 max-w-sm text-sm leading-6 text-neutral-600">
            Peças versáteis, estilo urbano e personalidade em cada detalhe.
            Encontre seu jeito de vestir.
          </p>

          <a
            href="#colecao"
            className="mt-8 bg-neutral-900 px-7 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-neutral-700"
          >
            EXPLORAR COLEÇÃO →
          </a>
        </div>

        <div className="flex min-h-[350px] items-center justify-center bg-neutral-200 p-8">
          <div className="flex aspect-[4/5] w-full max-w-sm flex-col items-center justify-center border border-neutral-400/50 bg-neutral-300">
            <span className="text-4xl font-black tracking-[0.15em] sm:text-5xl">
              CARLO’S
            </span>
            <span className="mt-3 text-xs tracking-[0.3em]">
              VISTA SUA ESSÊNCIA
            </span>
          </div>
        </div>
      </section>

      <section id="colecao" className="px-6 py-20 md:px-12 lg:px-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs tracking-[0.25em] text-neutral-500">
              SELEÇÃO EXCLUSIVA
            </p>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Destaques da coleção
            </h2>
          </div>

        </div>

        {carregando && <p>Carregando produtos...</p>}

        {erro && <p className="text-red-600">{erro}</p>}

        {!carregando && !erro && produtos.length === 0 && (
          <div className="border border-dashed border-neutral-300 px-6 py-12 text-center">
            <h3 className="text-lg font-semibold">
              Nossa coleção está esperando por você.
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Cadastre o primeiro produto para preencher a vitrine.
            </p>
          
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((produto) => (
            <article key={produto.id} className="group">
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-neutral-100">
                {produto.imagem_url ? (
                  <img
                    src={produto.imagem_url}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="px-4 text-center text-2xl font-black tracking-widest text-neutral-400">
                    CARLO’S.
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-3 py-4">
                <div>
                  {produto.categoria && (
                    <p className="mb-2 text-[10px] tracking-[0.2em] text-neutral-500">
                      {produto.categoria}
                    </p>
                  )}
                  <h3 className="font-semibold">{produto.nome}</h3>
                  {produto.descricao && (
                    <p className="mt-1 text-sm text-neutral-600">
                      {produto.descricao}
                    </p>
                  )}
                </div>

                <p className="whitespace-nowrap text-sm font-semibold">
                  R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                </p>
              </div>

              <button
                onClick={() => simularPedido(produto)}
                className="w-full border border-neutral-900 bg-neutral-900 py-3 text-xs font-semibold tracking-widest text-white transition hover:bg-neutral-700"
              >
                SIMULAR PEDIDO
              </button>
            </article>
          ))}
        </div>
      </section>

      <section
        id="sobre"
        className="bg-neutral-900 px-6 py-16 text-center text-white md:px-12"
      >
        <p className="mb-4 text-xs tracking-[0.3em] text-neutral-400">
          NOSSA IDENTIDADE
        </p>
        <h2 className="text-3xl font-bold md:text-4xl">
          Vista o que representa você.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-neutral-300">
          A Carlo’s combina estilo, versatilidade e personalidade em uma
          experiência de moda pensada para quem tem identidade própria.
        </p>
      </section>

      <footer className="flex flex-col justify-between gap-4 px-6 py-8 text-xs text-neutral-500 md:flex-row md:px-12">
        <span className="font-bold tracking-widest">CARLO’S.</span>
        <span>© 2026 Carlo’s. Projeto demonstrativo de portfólio.</span>
      </footer>
    </main>
  );
}
