// popup.js
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('products-container');
    const refreshBtn = document.querySelector('.refresh-btn');
    let displayLimit = 3;
  
    function openProductWindow(url) {
      // Configuración de la nueva ventana
      const windowWidth = 1024;  // Ancho de la ventana
      const windowHeight = 768;  // Alto de la ventana
      
      // Calcular la posición para centrar la ventana
      const left = (screen.width - windowWidth) / 2;
      const top = (screen.height - windowHeight) / 2;
  
      // Configuración de la ventana
      const windowFeatures = `
        width=${windowWidth},
        height=${windowHeight},
        left=${left},
        top=${top},
        menubar=no,
        toolbar=no,
        location=yes,
        status=no,
        resizable=yes,
        scrollbars=yes
      `.replace(/\s+/g, ''); // Eliminar espacios en blanco
  
      // Abrir la nueva ventana
      window.open(url, '_blank', windowFeatures);
    }
  
    async function removeProduct(timestamp) {
      try {
        const data = await chrome.storage.local.get('products');
        const products = data.products || [];
        const updatedProducts = products.filter(p => p.timestamp !== timestamp);
        await chrome.storage.local.set({ products: updatedProducts });
        await loadProducts();
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    }
  
    async function loadProducts() {
      try {
        const data = await chrome.storage.local.get('products');
        const products = data.products || [];
        
        container.innerHTML = '';
        
        if (products.length === 0) {
          container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666; ">
              No hay productos guardados
            </div>
          `;
          return;
        }
  
        products.slice(0, displayLimit).forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.style.cursor = 'pointer';
          card.style.transition = 'transform 0.2s, box-shadow 0.2s';
          
          card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          });
          
          card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          });
  
          card.innerHTML = `
            <img class="product-image" style="width: 100px;" src="${product.image}" alt="${product.title}" 
                 onerror="this.src='default-product.png'">
            <div class="product-info">
              <h3 class="product-title">${product.title}</h3>
              <p class="product-description">${product.description}</p>
            </div>
            <div class="action-buttons">
              <button class="delete-btn" data-timestamp="${product.timestamp}" ><img src="/IMG/trash.png" alt="Trash" width="20px" height="20px"></button>
            </div>
        `;

        // Evento click para abrir el producto en una nueva ventana
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-btn')) {
              // Abrir en nueva pestaña
              chrome.tabs.create({ 
                url: product.url,
                active: true // La nueva pestaña se activará automáticamente
              });
            }
        });

        // Evento para el botón de eliminar
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation(); // Prevenir que se abra la ventana al eliminar
          const timestamp = parseInt(deleteBtn.dataset.timestamp);
          await removeProduct(timestamp);
        });

        container.appendChild(card);
      });

      // Mostrar u ocultar el botón "Cargar Mas..."
      const loadMoreBtn = document.querySelector('.load-more');
      if (products.length > displayLimit) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }

    } catch (error) {
      console.error('Error al cargar los productos:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
          Error al cargar los productos
        </div>
      `;
    }
  }

  // Cargar productos inicialmente
  await loadProducts();

  // Botón de refrescar
  refreshBtn.addEventListener('click', async () => {
    try {
      refreshBtn.style.transform = 'rotate(360deg)';
      refreshBtn.style.transition = 'transform 0.5s';
      await loadProducts();
      setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
        refreshBtn.style.transition = 'none';
      }, 500);
    } catch (error) {
      console.error('Error al refrescar la lista:', error);
    }
  });

  // Botón de cargar más
  const loadMoreBtn = document.querySelector('.load-more');
  loadMoreBtn.addEventListener('click', async () => {
    displayLimit += 3;
    await loadProducts();
  });
});
