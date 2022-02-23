function initSelects() {
    let selects = document.querySelectorAll('select');

    selects.forEach(select => {
        let container = select.parentElement.parentElement.nextElementSibling;
        let cards = container.querySelectorAll('.card-post');
        let cantidad = select.value;

        if(cards.length > 0) {
            cards.forEach(card => {
                if(card) {
                    card.classList.add('d-none');
                }
            });

            for (let i = 0; i < cantidad; i++) {
                if(cards[i]) {
                    cards[i].classList.remove('d-none');
                }
            }

            select.addEventListener('change', () => {
                initSelects();
            });
        }
    });
}