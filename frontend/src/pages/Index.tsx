import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Map,
  FlaskConical,
  GraduationCap,
  Users,
  LineChart,
  CheckCircle,
  Menu,
  X,
} from 'lucide-react';
import MapaPiaui from '../components/MapaPiaui';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: TrendingUp, title: 'Monitoramento 24/7', desc: 'Coleta de dados climáticos em tempo real integrados com indicadores de saúde epidemiológica.' },
    { icon: Map, title: 'Territorialização GIS', desc: 'Mapas interativos que identificam zonas de risco e áreas prioritárias para intervenção em saúde.' },
    { icon: FlaskConical, title: 'Laboratório In Situ', desc: 'Análises laboratoriais de vetores e contaminantes ambientais ligados a eventos climáticos.' },
    { icon: GraduationCap, title: 'Capacitação Acadêmica', desc: 'Desenvolvimento de competências para alunos da UESPI no cenário de mudanças globais.' },
    { icon: Users, title: 'Engajamento Comunitário', desc: 'Educação em saúde diretamente nos territórios para fortalecer a resiliência local.' },
    { icon: LineChart, title: 'Modelagem Preditiva', desc: 'Uso de inteligência de dados para prever surtos de doenças sensíveis ao clima.' },
  ];

  // ============================================================
  // PARCEIROS - Adicione ou remova parceiros aqui com sua imagem
  // ============================================================
  const partners = [
    {
      name: 'SUS',
      image: 'https://static.cdnlogo.com/logos/s/74/sus-brasil.svg',
      hasImage: true
    },
    {
      name: 'UESPI',
      image: 'uespi.png',
      hasImage: true
    },
    {
      name: 'FAPEPI',
      image: 'https://www.fapepi.pi.gov.br/wp-content/uploads/2020/06/Prancheta-3-scaled.png',
      hasImage: true
    },
    {
      name: 'CNPq',
      image: 'https://memoria.cnpq.br/image/image_gallery?uuid=93be9ef0-6f46-4291-86ee-e0246da82a25&groupId=10157&t=1336081261854',
      hasImage: true
    },
    // { 
    //   name: 'MS', 
    //   image: '',
    //   hasImage: false 
    // },
    // ============================================================
    // Adicione novos parceiros aqui:
    // ============================================================
    // { 
    //   name: 'FIOCRUZ', 
    //   image: 'https://exemplo.com/logo-fiocruz.png',
    //   hasImage: true 
    // },
    // { 
    //   name: 'UFMA', 
    //   image: '',
    //   hasImage: false 
    // },
  ];

  return (
    <div className="bg-[#f7faf8] text-[#181c1c] font-['Inter'] overflow-x-hidden selection:bg-[#004e47]/20 selection:text-[#004e47]">
      {/* Top Navigation Bar */}
      <nav className={`fixed top-4 left-0 w-full z-50 px-6 transition-all duration-500`}>
        <div className={`max-w-[1280px] mx-auto rounded-full shadow-lg border border-white/40 px-6 flex justify-between items-center transition-all duration-500 ${scrolled
          ? 'bg-white/90 py-3'
          : 'glass-card py-2'
          }`}>
          <div className="flex items-center gap-2">
            <img
              src="petsaudeclima_icon.png"
              alt="PET-Saúde Clima Logo"
              className="h-10 w-auto"
            />
            <span className="text-sm font-bold text-[#004e47] tracking-tight">
              PET-Saúde Clima
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-[#004e47] font-medium border-b-2 border-[#004e47] pb-1 text-xs uppercase tracking-wider">Início</a>
            <a href="#territories" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-xs uppercase tracking-wider">Territórios</a>
            <a href="#data" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-xs uppercase tracking-wider">Dados</a>
            <a href="#publications" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-xs uppercase tracking-wider">Publicações</a>
            <a href="#about" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-xs uppercase tracking-wider">Sobre</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cadastro')}
              className="bg-[#004e47] text-white text-xs font-medium px-4 py-2 rounded-full shadow-[0_4px_14px_0_rgba(0,78,71,0.39)] hover:shadow-[0_6px_20px_rgba(0,78,71,0.23)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              Cadastrar
              <ArrowRight size={16} />
            </button>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden bg-transparent border-none cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} className="text-[#181c1c]" /> : <Menu size={24} className="text-[#181c1c]" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 glass-card rounded-2xl p-4 flex flex-col gap-3">
            <a href="#" className="text-[#004e47] font-medium text-sm">Início</a>
            <a href="#territories" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-sm">Territórios</a>
            <a href="#data" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-sm">Dados</a>
            <a href="#publications" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-sm">Publicações</a>
            <a href="#about" className="text-[#3e4947] hover:text-[#004e47] transition-colors text-sm">Sobre</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Piauí Landscape"
            className="w-full h-full object-cover scale-105 transform transition-transform duration-[20s] ease-out hover:scale-110"
            src="https://ipiranganews.inf.br/wp-content/uploads/VIAGEM-4-03-08-21.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#f7faf8] via-transparent to-transparent"></div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 w-full relative z-10 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            {/* Coluna da Esquerda - Texto */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2 glass-dark rounded-full text-white/90 text-xs font-medium uppercase tracking-[0.15em] border border-white/20">
                Monitoramento Territorial
              </div>
              <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-xl">
                Monitoramento Inteligente de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#79fabf] to-[#76f7bc]">Saúde e Clima</span> no Piauí
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-lg font-light">
                Ciência e tecnologia a serviço da saúde pública. Analisamos os impactos das mudanças climáticas nos territórios piauienses para construir resiliência e bem-estar.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-4 bg-white text-[#004e47] rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-[#ebefed] hover:shadow-xl transition-all duration-300 group"
                >
                  Explorar Dados
                  <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button className="px-6 py-4 glass-dark text-white rounded-full font-medium text-sm hover:bg-white/10 transition-all duration-300">
                  Ver Publicações
                </button>
              </div>
            </div>

            {/* Coluna da Direita - Cards Distribuídos como Fotos (4 Cidades) */}
            <div className="relative hidden lg:flex justify-end items-center">
              <div className="relative w-[520px] h-[540px]">
                {/* Card 1 - Piripiri (Canto superior esquerdo) */}
                <div
                  className="absolute top-[0rem] left-[4rem] w-[260px] glass-card p-4 rounded-[24px] shadow-2xl transition-all duration-500 ease-out z-10 hover:z-50 hover:scale-110 hover:-translate-y-6 hover:rotate-0 group/card1"
                  style={{ transform: 'rotate(-6deg)' }}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative group">
                    <img
                      alt="Piripiri - Piauí"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src="https://coalizaopelasevidencias.org.br/wp-content/uploads/2023/10/PIRIPIRI-VISTA-AREA.jpg"
                    />
                    <div className="absolute inset-0 bg-[#004e47]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-base">Piripiri</p>
                      <span className="px-3 py-1 bg-[#004e47]/10 text-[#004e47] text-[10px] rounded-full font-bold uppercase tracking-wider">Monitoramento</span>
                    </div>
                    <p className="text-[#3e4947] text-sm leading-relaxed">Análise de vulnerabilidades climáticas e impactos na saúde da população.</p>
                  </div>
                </div>

                {/* Card 2 - Teresina (Centro direita) */}
                <div
                  className="absolute top-8 right-[-3rem] w-[260px] glass-card p-4 rounded-[24px] shadow-2xl transition-all duration-500 ease-out z-20 hover:z-50 hover:scale-110 hover:-translate-y-6 hover:rotate-0 group/card2"
                  style={{ transform: 'rotate(5deg)' }}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative group">
                    <img
                      alt="Teresina - Piauí"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src="https://www.viagensecaminhos.com/wp-content/uploads/2024/08/teresina-piaui.jpg"
                    />
                    <div className="absolute inset-0 bg-[#004e47]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-base">Teresina</p>
                      <span className="px-3 py-1 bg-[#004e47]/10 text-[#004e47] text-[10px] rounded-full font-bold uppercase tracking-wider">Dados</span>
                    </div>
                    <p className="text-[#3e4947] text-sm leading-relaxed">Integração de dados climáticos e epidemiológicos para vigilância em saúde.</p>
                  </div>
                </div>

                {/* Card 3 - Parnaíba (Inferior esquerdo) */}
                <div
                  className="absolute bottom-[-1rem] left-0 w-[260px] glass-card p-4 rounded-[24px] shadow-2xl transition-all duration-500 ease-out z-30 hover:z-50 hover:scale-110 hover:-translate-y-6 hover:rotate-0 group/card3"
                  style={{ transform: 'rotate(-3deg)' }}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative group">
                    <img
                      alt="Parnaíba - Piauí"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src="https://rotasdasemocoes.com.br/wp-content/uploads/2022/04/parnaiba.jpg"
                    />
                    <div className="absolute inset-0 bg-[#004e47]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-base">Parnaíba</p>
                      <span className="px-3 py-1 bg-[#004e47]/10 text-[#004e47] text-[10px] rounded-full font-bold uppercase tracking-wider">Ação</span>
                    </div>
                    <p className="text-[#3e4947] text-sm leading-relaxed">Capacitação comunitária e ações de mitigação para resiliência climática.</p>
                  </div>
                </div>

                {/* Card 4 - Picos (Inferior direito) */}
                <div
                  className="absolute bottom-[-1rem] right-[-2rem] w-[260px] glass-card p-4 rounded-[24px] shadow-2xl transition-all duration-500 ease-out z-40 hover:z-50 hover:scale-110 hover:-translate-y-6 hover:rotate-0 group/card4"
                  style={{ transform: 'rotate(2deg)' }}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative group">
                    <img
                      alt="Picos - Piauí"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Panor%C3%A2mica_30.jpg?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=original"
                    />
                    <div className="absolute inset-0 bg-[#004e47]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="pt-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-base">Picos</p>
                      <span className="px-3 py-1 bg-[#004e47]/10 text-[#004e47] text-[10px] rounded-full font-bold uppercase tracking-wider">Educação</span>
                    </div>
                    <p className="text-[#3e4947] text-sm leading-relaxed">Formação acadêmica e pesquisa aplicada para enfrentamento das mudanças climáticas.</p>
                  </div>
                </div>

                {/* Indicador visual de interação */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white/30 text-[10px] font-medium tracking-wider whitespace-nowrap pointer-events-none">
                  ✦ Passe o mouse para ver melhor ✦
                </div>
              </div>
            </div>

            {/* Versão Mobile dos Cards - 4 Cidades */}
            <div className="lg:hidden w-full mt-8 space-y-4">
              {/* Card 1 - Piripiri */}
              <div className="glass-card p-3 rounded-[20px] w-full shadow-2xl">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      alt="Piripiri - Piauí"
                      className="w-full h-full object-cover"
                      src="https://coalizaopelasevidencias.org.br/wp-content/uploads/2023/10/PIRIPIRI-VISTA-AREA.jpg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-sm">Piripiri</p>
                      <span className="px-2 py-0.5 bg-[#004e47]/10 text-[#004e47] text-[8px] rounded-full font-bold uppercase tracking-wider">Monitoramento</span>
                    </div>
                    <p className="text-[#3e4947] text-xs leading-relaxed line-clamp-1">Análise de vulnerabilidades climáticas</p>
                  </div>
                </div>
              </div>

              {/* Card 2 - Teresina */}
              <div className="glass-card p-3 rounded-[20px] w-full shadow-2xl">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      alt="Teresina - Piauí"
                      className="w-full h-full object-cover"
                      src="https://www.viagensecaminhos.com/wp-content/uploads/2024/08/teresina-piaui.jpg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-sm">Teresina</p>
                      <span className="px-2 py-0.5 bg-[#004e47]/10 text-[#004e47] text-[8px] rounded-full font-bold uppercase tracking-wider">Dados</span>
                    </div>
                    <p className="text-[#3e4947] text-xs leading-relaxed line-clamp-1">Integração de dados climáticos</p>
                  </div>
                </div>
              </div>

              {/* Card 3 - Parnaíba */}
              <div className="glass-card p-3 rounded-[20px] w-full shadow-2xl">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      alt="Parnaíba - Piauí"
                      className="w-full h-full object-cover"
                      src="https://rotasdasemocoes.com.br/wp-content/uploads/2022/04/parnaiba.jpg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-sm">Parnaíba</p>
                      <span className="px-2 py-0.5 bg-[#004e47]/10 text-[#004e47] text-[8px] rounded-full font-bold uppercase tracking-wider">Ação</span>
                    </div>
                    <p className="text-[#3e4947] text-xs leading-relaxed line-clamp-1">Capacitação comunitária</p>
                  </div>
                </div>
              </div>

              {/* Card 4 - Picos */}
              <div className="glass-card p-3 rounded-[20px] w-full shadow-2xl">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      alt="Picos - Piauí"
                      className="w-full h-full object-cover"
                      src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Panor%C3%A2mica_30.jpg?utm_source=pt.wikipedia.org&utm_campaign=index&utm_content=original"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="text-[#004e47] font-bold text-sm">Picos</p>
                      <span className="px-2 py-0.5 bg-[#004e47]/10 text-[#004e47] text-[8px] rounded-full font-bold uppercase tracking-wider">Educação</span>
                    </div>
                    <p className="text-[#3e4947] text-xs leading-relaxed line-clamp-1">Formação acadêmica e pesquisa</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Instituições Parceiras */}
      <section className="py-16 mesh-gradient relative z-20">
        <div className="max-w-[90%] w-full mx-auto px-6">
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-6 max-w-5xl mx-auto border-white/60">
            <h2 className="text-xs font-medium text-[#3e4947]/60 uppercase tracking-[0.2em]">Instituições Parceiras</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
              {partners.map((partner) => (
                <div key={partner.name} className="h-12 w-32 flex items-center justify-center hover:scale-105 transition-transform">
                  {partner.hasImage && partner.image ? (
                    <img
                      alt={partner.name}
                      className="h-full object-contain"
                      src={partner.image}
                    />
                  ) : (
                    <span className="font-bold text-[#3e4947] text-2xl tracking-tight">
                      {partner.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* O que é o PET-Saúde */}
      <section className="py-16 lg:py-24 bg-[#f7faf8]" id="about">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-[#181c1c] mb-4">O que é o PET-Saúde Clima?</h2>
            <div className="w-16 h-1 bg-[#004e47] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-16 lg:mb-32">
            <div className="order-2 lg:order-1 space-y-4">
              <h3 className="text-2xl font-semibold text-[#004e47] tracking-tight">Integração Ensino-Serviço-Comunidade</h3>
              <p className="text-lg text-[#3e4947] font-light">
                O Programa de Educação pelo Trabalho para a Saúde (PET-Saúde) é uma estratégia do Ministério da Saúde que busca fortalecer a formação de profissionais através de vivências práticas no SUS.
              </p>
              <p className="text-lg text-[#3e4947] font-light">
                Nesta edição "Clima", focamos na intersecção entre determinantes ambientais e a saúde pública, capacitando alunos e profissionais para os desafios do século XXI.
              </p>
            </div>
            <div className="order-1 lg:order-2 rounded-[32px] overflow-hidden shadow-2xl border border-[#bec9c6]/30 group">
              <img className="w-full h-72 lg:h-[450px] object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCosRl8ZLtA5HynC6MK7i0_LM7JHtLP4GltKxmt4bEUiR6LjabsJIiQ3Te558cAYiJ-yqFgroHE6E7azypcCLX5O8jWAKymosZeHng2ZlyjdnjX9VFWPdeQ3_-qFu6tG-bli16leXBbIoYEyBEc6XuCBfxtop0b9JwlE9WvFIsu53W1EihzgntIOy3vaq8GkVu82iSPOzlzagp0nMxrdEjW3477nGLwOVd43BgDPLu0O8dQojkiOv_aZg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="rounded-[32px] overflow-hidden shadow-2xl border border-[#bec9c6]/30 group">
              <img className="w-full h-72 lg:h-[450px] object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2EpENb-0olZD0QLx9ZDG0T_iAUVEABoZedT3uK-WRTbrWujsW4CjOCnixgThDEuVh9YNL5Wcj1Uko-4KaUo57XYTuIfxicoMwlq_8VFFpGO6bQmjUonZN_SfJXfRmKwnNvx3OvXDORqp1a8k8rNez_7v5S0_htuhl3WJrAg-0ro5TBj_7jlyaXQ3qZkwfGaMiOxqLiU_ESDPnxno5dv_Pl2LcAFHFNKipBYje8rIWe0pf6IM3lGIzEw" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-[#004e47] tracking-tight">Foco nos Territórios do Piauí</h3>
              <p className="text-lg text-[#3e4947] font-light">
                Nossa atuação é territorializada, entendendo que cada região do Piauí possui vulnerabilidades e potências climáticas únicas.
              </p>
              <ul className="space-y-2 mt-6">
                <li className="flex items-center gap-2 bg-[#f1f4f2] p-3 rounded-xl">
                  <CheckCircle size={20} className="text-[#006c49]" />
                  <span className="text-base font-medium text-[#181c1c]">Mapeamento de vulnerabilidades locais</span>
                </li>
                <li className="flex items-center gap-2 bg-[#f1f4f2] p-3 rounded-xl">
                  <CheckCircle size={20} className="text-[#006c49]" />
                  <span className="text-base font-medium text-[#181c1c]">Ações de mitigação em comunidades tradicion</span>
                </li>
                <li className="flex items-center gap-2 bg-[#f1f4f2] p-3 rounded-xl">
                  <CheckCircle size={20} className="text-[#006c49]" />
                  <span className="text-base font-medium text-[#181c1c]">Produção científica voltada à gestão municipal</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Feature Cards */}
      <section className="py-16 lg:py-24 mesh-gradient" id="data">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-[#006c49] uppercase tracking-[0.2em]">Nossas Ferramentas</span>
            <h2 className="text-3xl font-semibold text-[#181c1c] mt-2">Ciência aplicada à vigilância</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="premium-hover p-6 bg-white/80 backdrop-blur-md border border-white rounded-[24px] group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#004e47]/5 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="w-14 h-14 bg-[#00685f]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform duration-300">
                  <feature.icon size={32} className="text-[#004e47]" />
                </div>
                <h4 className="text-2xl font-semibold mb-2 tracking-tight text-[#181c1c]">{feature.title}</h4>
                <p className="text-[#3e4947] text-base font-light leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Timeline */}
      <section className="py-16 lg:py-24 bg-[#f7faf8] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="text-3xl font-semibold text-[#181c1c] text-center mb-16">Jornada PET-Saúde</h2>
          <div className="relative max-w-5xl mx-auto mt-16">
            <div className="absolute top-8 left-0 w-full h-0.5 bg-[#bec9c6]/30 hidden md:block"></div>
            <div className="flex flex-col md:flex-row justify-between items-start relative gap-16">
              {[
                { year: '08', title: 'Início Nacional', desc: 'Lançamento do primeiro edital PET-Saúde pelo Ministério.', active: true },
                { year: '14', title: 'Consolidação UESPI', desc: 'Expansão do programa em diversos campi do Piauí.', active: false },
                { year: '24', title: 'Edição Clima', desc: 'Foco total em sustentabilidade e emergências climáticas.', active: true },
                { year: '26', title: 'Legado Digital', desc: 'Meta de digitalização 100% dos dados territoriais.', active: false },
              ].map((item, index) => (
                <div key={index} className="flex-1 flex flex-col md:items-center text-left md:text-center group">
                  <div className={`w-16 h-16 rounded-full bg-white border-[6px] border-[#f7faf8] z-10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${item.active && item.year === '24'
                    ? 'shadow-[0_0_0_4px_rgba(0,78,71,0.3)] bg-[#004e47]'
                    : item.active
                      ? 'shadow-[0_0_0_2px_rgba(0,78,71,0.2)]'
                      : 'shadow-[0_0_0_2px_rgba(110,121,119,0.3)]'
                    } ${item.year === '26' ? 'border-dashed' : ''}`}>
                    <span className={`font-bold text-lg ${item.active ? 'text-primary-hover' : 'text-[#004e47]'}`}>
                      {item.year}
                    </span>
                  </div>
                  <h5 className={`font-bold mb-2 text-lg ${item.active ? 'text-[#004e47]' : 'text-[#181c1c]'}`}>{item.title}</h5>
                  <p className="text-sm text-[#3e4947] font-light leading-relaxed max-w-[200px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mapa Interativo do Piauí */}
      <section className="py-16 lg:py-24 mesh-gradient" id="territories">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <span className="px-4 py-1.5 bg-[#76f7bc]/50 text-[#005236] text-xs font-semibold rounded-full tracking-wide">
                  Painel Interativo
                </span>
                <h2 className="text-3xl font-semibold text-[#181c1c] mt-2 tracking-tight">
                  Mapeamento de Territórios
                </h2>
              </div>
              <p className="text-lg text-[#3e4947] font-light leading-relaxed">
                Utilizamos tecnologia de geoprocessamento ArcGIS para visualizar o cruzamento de dados de calor, umidade e incidência de arboviroses em cada bairro.
              </p>
              <div className="space-y-2 pt-4">
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 flex items-center justify-between cursor-pointer premium-hover">
                  <span className="font-medium text-[#181c1c]">Teresina - Região Central</span>
                  <ArrowRight size={20} className="text-[#004e47]" />
                </div>
                <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 flex items-center justify-between cursor-pointer premium-hover">
                  <span className="font-medium text-[#181c1c]">Parnaíba - Litoral</span>
                  <ArrowRight size={20} className="text-[#004e47]" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 relative">
              <div className="aspect-video rounded-[32px] overflow-hidden shadow-2xl border border-white/50 relative group">
                {/* Mapa Interativo do Piauí */}
                <MapaPiaui />

                {/* Tooltip flutuante */}
                <div className="absolute bottom-8 left-8 glass-card p-6 rounded-2xl max-w-sm animate-pulse border-white/60 z-[1000]">
                  <h6 className="font-bold text-[11px] text-[#ba1a1a] uppercase tracking-widest mb-1">
                    Zona em Alerta
                  </h6>
                  <p className="text-lg font-semibold text-[#181c1c] mb-3">
                    Nível de Umidade: 12%
                  </p>
                  <div className="w-full h-2.5 bg-[#bec9c6]/30 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-gradient-to-r from-[#ba1a1a] to-[#ffdad6] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large Green CTA Section */}
      <section className="py-16 lg:py-24 bg-[#f7faf8]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="bg-[#004e47] rounded-[48px] p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl border border-[#a1f1e5]/20">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#006c49] opacity-40 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#a1f1e5] opacity-20 rounded-full blur-[100px]"></div>
            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
              <h2 className="text-5xl font-bold text-white tracking-tight">Faça parte da transformação na Saúde Pública</h2>
              <p className="text-lg text-[#a1f1e5]/90 font-light max-w-2xl mx-auto leading-relaxed">
                Seja você um estudante, pesquisador ou gestor público, o PET-Saúde Clima é o espaço para construir o futuro resiliente do Piauí.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <button className="px-8 py-6 bg-[#79fabf] text-[#002113] rounded-full font-bold text-lg hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_8px_30px_rgba(121,250,191,0.3)]">
                  Quero me inscrever
                </button>
                <button className="px-8 py-6 bg-transparent border-2 border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/10 hover:border-white transition-all duration-300">
                  Falar com a coordenação
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#ffffff] border-t border-[#bec9c6]/20 py-16 mt-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-16">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="petsaudeclima_icon.png"
                  alt="PET-Saúde Clima Logo"
                  className="h-10 w-auto"
                />
                <span className="text-sm font-bold text-[#004e47] tracking-tight">
                  PET-Saúde Clima
                </span>
              </div>
              <p className="text-[#3e4947] text-base font-light leading-relaxed mb-6">
                Uma iniciativa conjunta para enfrentar os desafios das mudanças climáticas através da integração entre universidade e sistema de saúde.
              </p>
              <div className="flex gap-2">
                <a className="w-12 h-12 rounded-2xl bg-[#f1f4f2] flex items-center justify-center hover:bg-[#00685f]/10 hover:-translate-y-1 transition-all duration-300" href="#">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                  </svg>
                </a>
                <a className="w-12 h-12 rounded-2xl bg-[#f1f4f2] flex items-center justify-center hover:bg-[#00685f]/10 hover:-translate-y-1 transition-all duration-300" href="#">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-32">
              <div className="space-y-4">
                <h6 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#181c1c]">Navegação</h6>
                <ul className="space-y-2">
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Início</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Sobre</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Territórios</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Dados</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h6 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#181c1c]">Institucional</h6>
                <ul className="space-y-2">
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">UESPI</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">SUS</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Ministério da Saúde</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">FAPEPI</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h6 className="font-semibold text-xs uppercase tracking-[0.15em] text-[#181c1c]">Suporte</h6>
                <ul className="space-y-2">
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Contato</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Privacidade</a></li>
                  <li><a className="text-[#3e4947] hover:text-[#004e47] text-sm transition-colors" href="#">Termos de Uso</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-[#bec9c6]/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#3e4947]/70 font-light">© 2026 PET-Saúde Clima - Territórios do Piauí. Ciência e Saúde Pública.</p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 opacity-60 grayscale">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center p-1">
                  <img className="h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxQvTRNagHRE2jktAacwlXW3BG0cxxmVfnMEZlMwevXLZKC1PQQcbSiFunCND61IkbmLXvL_BkP6dbA5wF5WRe28gN7mABMAvs8riha9_P0ugTeiSNBJrlA-YJdcW56UdJ_4rTKQkmwTT6eCDGT8NV-dNWf_nY8D8GeUiupwhgFXJs9d2QLVpG_YhY1pnb0UCCgGpt2Vxarn5ZJpWnviRvAjmCCa8F2lqI6bUP9v_iLrrmTNhvpakn_w" />
                </span>
                <span className="w-14 h-10 rounded-lg flex items-center justify-center p-1">
                  <img className="h-full object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRjANbOzfML6PCfOT8I8ejiNI6v5HN9bVw4s7mACv8u7boH31piXAwKbVAjWzdNCjMSb4CgEs0aRMyoLNiMo4r_t1DKQoGXN1S4AtMtgTBuMbRqB4mtFzVcJ2PmM8wrpOHRhumBDUpDnSu5QYY9g3zasBl4lBlRwWsKNfYm2DD-gOhm6BQlc4nFqbTr0Eb7Jub3VBnHj0QOXKiGrRCc4WXCyB6cR5GpeVuyqujGBNiJGCXjFak4w9_uA" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
        }
        .glass-dark {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .mesh-gradient {
          background-color: #f7faf8;
          background-image: 
            radial-gradient(at 40% 20%, hsla(170, 100%, 95%, 1) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(160, 80%, 95%, 1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(150, 70%, 95%, 1) 0px, transparent 50%);
        }
        .premium-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -10px rgba(0, 78, 71, 0.15);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}