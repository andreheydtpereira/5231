
(function(){
  function cards(){
    return Array.from(document.querySelectorAll('.func-card'));
  }

  function cardStep(){
    const first = cards()[0];
    if(!first) return 0;
    const style = window.getComputedStyle(first);
    const mr = parseFloat(style.marginRight || 0);
    const ml = parseFloat(style.marginLeft || 0);
    const section = document.querySelector('.carousel-shell');
    const viewport = section ? section.clientWidth : window.innerWidth;
    const cardWidth = first.getBoundingClientRect().width + ml + mr + 18;
    const centerOffset = Math.max(0, (viewport - first.getBoundingClientRect().width) / 2);
    return {cardWidth, centerOffset};
  }

  function renderCarousel(){
    const list = cards();
    list.forEach((card, idx) => card.classList.toggle('active', idx === PROM.state.carouselIndex));
    const track = document.getElementById('mainCarouselTrack');
    if(track && list.length){
      const {cardWidth, centerOffset} = cardStep();
      const offset = (PROM.state.carouselIndex * cardWidth) - centerOffset;
      track.style.transform = 'translateX(-' + Math.max(0, offset) + 'px)';
    }
    if(PROM.save) PROM.save();
  }

  function move(dir){
    const list = cards();
    const max = list.length - 1;
    PROM.state.carouselIndex = Math.max(0, Math.min(max, PROM.state.carouselIndex + dir));
    renderCarousel();
  }

  window.addEventListener('DOMContentLoaded', function(){
    document.getElementById('carouselPrev').addEventListener('click', () => move(-1));
    document.getElementById('carouselNext').addEventListener('click', () => move(1));
    window.addEventListener('resize', renderCarousel);
    renderCarousel();
  });

  PROM.renderCarousel = renderCarousel;
})();
