from pathlib import Path
from urllib.parse import quote
import html

base = Path('public/galeria')
assert base.exists() and base.is_dir(), 'public/galeria não encontrada'

categories = [
    {'name': 'compressores', 'title': 'Compressores', 'desc': 'Manutenção e aluguel de compressores industriais e equipamentos de ar comprimido.', 'icon': 'cloud'},
    {'name': 'esmerilhadeira', 'title': 'Esmerilhadeiras', 'desc': 'Esmerilhadeiras e acessórios para corte, desbaste e acabamento.', 'icon': 'scissors'},
    {'name': 'extrusoras', 'title': 'Extrusoras', 'desc': 'Extrusoras de solda plástica para indústria e reparos.', 'icon': 'cpu'},
    {'name': 'fotos', 'title': 'Fotos Gerais', 'desc': 'Galeria geral de serviços, equipamentos e projetos realizados.', 'icon': 'image'},
    {'name': 'geradores', 'title': 'Geradores', 'desc': 'Geradores de energia e sistemas de energia de reserva.', 'icon': 'battery'},
    {'name': 'lixadeira', 'title': 'Lixadeiras', 'desc': 'Lixadeiras orbitais, de parede e outras ferramentas de acabamento.', 'icon': 'award'},
    {'name': 'maquinas de solda diversas marcas e modelos', 'title': 'Máquinas de Solda', 'desc': 'Máquinas de solda por marca e modelo com foco em manutenção e aluguel.', 'icon': 'zap'},
    {'name': 'marteletes variados', 'title': 'Marteletes', 'desc': 'Marteletes elétricos e acessórios para trabalhos pesados.', 'icon': 'hammer'},
    {'name': 'motores', 'title': 'Motores', 'desc': 'Motores elétricos e peças para rebobinamento e manutenção.', 'icon': 'refresh-cw'},
    {'name': 'parafusadeira', 'title': 'Parafusadeiras', 'desc': 'Parafusadeiras e furadeiras de impacto para diversos serviços.', 'icon': 'tool'},
    {'name': 'politrz', 'title': 'Politrizes', 'desc': 'Politrizes para polimento e acabamento em metais e superfícies.', 'icon': 'circle'},
    {'name': 'repuxadeira', 'title': 'Repuxadeiras', 'desc': 'Repuxadeiras e spotters para funilaria e chaparias.', 'icon': 'corner-up-left'},
    {'name': 'serra marmore', 'title': 'Serra Mármore', 'desc': 'Serras mármore e ferramentas de corte para pedra e concreto.', 'icon': 'rotate-cw'},
]


def quote_path(value: str) -> str:
    return quote(value, safe='')


def build_gallery_index(categories):
    cards = []
    for cat in categories:
        folder = base / cat['name']
        preview = None
        if folder.exists() and folder.is_dir():
            files = sorted([p for p in folder.iterdir() if p.is_file()])
            if files:
                preview = quote_path(files[0].name)
        if preview:
            preview_html = '<img src="/galeria/{}/{}" alt="{}" class="h-52 w-full object-cover rounded-2xl mb-5">'.format(
                quote_path(cat["name"]), preview, html.escape(cat["title"]))
        else:
            preview_html = '<div class="h-52 w-full rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 text-xl">Sem imagem</div>'
        card = '''
          <a href="/galeria/{}/" class="service-card bg-gray-900 p-8 rounded-3xl shadow-xl hover:bg-gray-800 transition-colors duration-300">
            {}
            <div class="flex items-center gap-3 mb-4 text-yellow-400">
              <i data-feather="{}" class="h-8 w-8"></i>
              <span class="text-lg font-semibold">{}</span>
            </div>
            <p class="text-gray-400">{}</p>
            <span class="mt-6 inline-block font-semibold text-yellow-400">Ver categoria →</span>
          </a>'''.format(
            quote_path(cat['name']),
            preview_html,
            cat['icon'],
            html.escape(cat['title']),
            html.escape(cat['desc']))
        cards.append(card)
    
    cards_html = '\n'.join(cards)
    return '''<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Galeria | JM Elétrica</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/feather-icons"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox-plus-jquery.min.js"></script>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #111827; color: #F3F4F6; }
    .service-card { transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out; }
    .service-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(250, 204, 21, 0.12); }
  </style>
</head>
<body class="bg-gray-900 text-gray-100">
  <header class="bg-gray-950 border-b border-yellow-500/20 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
      <a href="/" class="text-3xl font-bold text-yellow-400">JM Elétrica</a>
      <nav class="flex flex-wrap items-center gap-4 text-gray-300">
        <a href="/" class="hover:text-yellow-400 transition">Início</a>
        <a href="/galeria/" class="hover:text-yellow-400 transition">Galeria</a>
      </nav>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <section class="text-center mb-16">
      <p class="text-sm uppercase tracking-[0.3em] text-yellow-400 mb-4">Galeria Completa</p>
      <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4">Galeria por Categoria</h1>
      <p class="text-gray-400 max-w-3xl mx-auto">Navegue pelas categorias organizadas pelas pastas do site. Cada página mostra as fotos correspondentes à categoria.</p>
    </section>
    <section class="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
''' + cards_html + '''
    </section>
  </main>

  <footer class="bg-black border-t border-yellow-500/20 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">&copy; 2026 JM Elétrica. Todas as imagens pertencem ao acervo da empresa.</div>
  </footer>

  <script>feather.replace(); lightbox.option({ 'resizeDuration': 200, 'wrapAround': true, 'albumLabel': 'Imagem %1 de %2' });</script>
</body>
</html>'''


def build_category_page(cat):
    folder = base / cat['name']
    if not folder.exists() or not folder.is_dir():
        return None
    images = sorted([path for path in folder.iterdir() if path.is_file()])
    image_blocks = []
    for image in images:
        filename_quoted = quote_path(image.name)
        title = html.escape(image.stem)
        img_html = '''
      <a href="./{}" data-lightbox="gallery" data-title="{}" class="block overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 shadow-lg hover:border-yellow-400">
        <img src="./{}" alt="{}" class="h-64 w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
      </a>'''.format(filename_quoted, title, filename_quoted, title)
        image_blocks.append(img_html)

    images_html = '\n'.join(image_blocks)
    cat_title = html.escape(cat['title'])
    cat_desc = html.escape(cat['desc'])
    return '''<!DOCTYPE html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{} | Galeria JM Elétrica</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/feather-icons"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/css/lightbox.min.css" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/js/lightbox-plus-jquery.min.js"></script>
  <style>
    body {{ font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }}
  </style>
</head>
<body class="bg-slate-950 text-slate-100">
  <header class="bg-slate-900/95 border-b border-yellow-500/20 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
      <a href="/" class="text-3xl font-bold text-yellow-400">JM Elétrica</a>
      <nav class="flex flex-wrap items-center gap-4 text-gray-300">
        <a href="/" class="hover:text-yellow-400 transition">Início</a>
        <a href="/galeria/" class="hover:text-yellow-400 transition">Galeria</a>
      </nav>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <section class="text-center mb-12">
      <p class="text-sm uppercase tracking-[0.3em] text-yellow-400 mb-4">Categoria</p>
      <h1 class="text-4xl sm:text-5xl font-bold text-white mb-4">{}</h1>
      <p class="text-gray-400 max-w-3xl mx-auto">{}</p>
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-300">
        <a href="/galeria/" class="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-3 font-semibold text-slate-950 hover:bg-yellow-300 transition">Voltar para Galeria</a>
        <a href="/" class="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-6 py-3 hover:border-yellow-400 hover:text-yellow-400 transition">Voltar ao site</a>
      </div>
    </section>
    <section class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
{}
    </section>
  </main>

  <footer class="bg-slate-900 border-t border-yellow-500/10 py-8 text-center text-gray-400">
    &copy; 2026 JM Elétrica. Categoria {}.
  </footer>

  <script>feather.replace(); lightbox.option({{ resizeDuration: 200, wrapAround: true, albumLabel: 'Imagem %1 de %2' }});</script>
</body>
</html>'''.format(cat_title, cat_title, cat_desc, images_html, cat_title)


def main():
    (base / 'index.html').write_text(build_gallery_index(categories), encoding='utf-8')
    for cat in categories:
        page = build_category_page(cat)
        if page is None:
            print('skip', cat['name'], 'missing folder')
            continue
        folder = base / cat['name']
        folder.mkdir(parents=True, exist_ok=True)
        (folder / 'index.html').write_text(page, encoding='utf-8')
    print('Gallery generated')


if __name__ == '__main__':
    main()