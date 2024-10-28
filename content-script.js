// content.js
function createSaveButton(productElement, productData) {
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 8px;
    margin-bottom: 5px;
  `;

  const saveButton = document.createElement('button');
  saveButton.className = "custom-button";
  saveButton.style.cssText = `
    padding: 4px 8px;
    background: none;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;

  const removeButton = document.createElement('button');
  removeButton.className = "custom-button";
  removeButton.style.cssText = `
    padding: 4px 8px;
    background: none;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    display: none;
  `;

  //SVG de guardar
  const heartFill = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  heartFill.setAttribute("width", "24");
  heartFill.setAttribute("height", "24");
  heartFill.setAttribute("viewBox", "0 0 24 24");
  heartFill.setAttribute("fill", "rgb(245, 93, 126)");
  
  const  heartPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  heartPath.setAttribute("d", "M20.205 4.791a5.938 5.938 0 0 0-4.209-1.754A5.906 5.906 0 0 0 12 4.595a5.904 5.904 0 0 0-3.996-1.558 5.942 5.942 0 0 0-4.213 1.758c-2.353 2.363-2.352 6.059.002 8.412L12 21.414l8.207-8.207c2.354-2.353 2.355-6.049-.002-8.416z");

  heartFill.appendChild(heartPath);
  removeButton.appendChild(heartFill);

  //SVG de Eliminar
  const heartNoFill = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  heartNoFill.setAttribute("width", "24");
  heartNoFill.setAttribute("height", "24");
  heartNoFill.setAttribute("viewBox", "0 0 24 24");
  heartNoFill.setAttribute("fill", "rgb(243, 96, 128)");


  heartNoFillpath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  heartNoFillpath.setAttribute("d", "M12 4.595a5.904 5.904 0 0 0-3.996-1.558 5.942 5.942 0 0 0-4.213 1.758c-2.353 2.363-2.352 6.059.002 8.412l7.332 7.332c.17.299.498.492.875.492a.99.99 0 0 0 .792-.409l7.415-7.415c2.354-2.354 2.354-6.049-.002-8.416a5.938 5.938 0 0 0-4.209-1.754A5.906 5.906 0 0 0 12 4.595zm6.791 1.61c1.563 1.571 1.564 4.025.002 5.588L12 18.586l-6.793-6.793c-1.562-1.563-1.561-4.017-.002-5.584.76-.756 1.754-1.172 2.799-1.172s2.035.416 2.789 1.17l.5.5a.999.999 0 0 0 1.414 0l.5-.5c1.512-1.509 4.074-1.505 5.584-.002z");

  heartNoFill.appendChild(heartNoFillpath);
  saveButton.appendChild(heartNoFill);

  saveButton.addEventListener('click', async () => {
      // Obtener la URL directa del producto
      let productUrl = '';
      const linkElement = productElement.querySelector('a[href*="/dp/"], a[href*="/gp/product/"]');
      
      if (linkElement) {
          const href = linkElement.getAttribute('href');
          
          // Validar que href sea una URL válida
          try {
              const url = new URL(href, window.location.origin); // Ensure full URL
              
              // Extraer el ASIN (ID del producto de Amazon)
              const asinMatch = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
              
              if (asinMatch) {
                  // Construir URL directa del producto usando el ASIN
                  productUrl = `${url.origin}/dp/${asinMatch[1]}`;
              } else {
                  productUrl = url.href; // Use full URL if ASIN not found
              }
          } catch (error) {
              console.error('URL inválida:', href);
          }
      }
      
      // Si no se encuentra la URL directa, usar la URL del enlace completo
      if (!productUrl && linkElement) {
          productUrl = new URL(linkElement.href, window.location.origin).href;
      }

      const product = {
        title: productData.title,
        image: productData.image,
        description: 'Producto de Amazon guardado',
        url: productUrl || window.location.href, // URL directa al producto
        timestamp: Date.now()
      };
  
      const existingProducts = await chrome.storage.local.get('products');
      const products = existingProducts.products || [];
      products.unshift(product);
      await chrome.storage.local.set({ products });
  
      saveButton.style.display = 'none';
      removeButton.style.display = 'block';
      
      const toast = document.createElement('div');
      toast.textContent = '✓ Producto guardado';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #00a650;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 10000;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
  });

  removeButton.addEventListener('click', async () => {
    const existingProducts = await chrome.storage.local.get('products');
    const products = existingProducts.products || [];
    const updatedProducts = products.filter(p => p.url !== productData.url);
    await chrome.storage.local.set({ products: updatedProducts });
    
    saveButton.style.display = 'block';
    removeButton.style.display = 'none';
  });

  buttonContainer.appendChild(saveButton);
  buttonContainer.appendChild(removeButton);
  
  chrome.storage.local.get('products', (data) => {
    const products = data.products || [];
    if (products.some(p => p.url === productData.url)) {
      saveButton.style.display = 'none';
      removeButton.style.display = 'block';
    }
  });

  return buttonContainer;
}

function addButtonsToProducts() {
  // Selectores para la página principal de producto
  const productPageSelectors = [
    '#titleSection', // Sección del título principal
    '#title_feature_div', // Div del título alternativo
    '#centerCol', // Columna central del producto
    '#ppd' // Contenedor principal del producto
  ];

  // Selectores originales para la lista de productos
  const listingSelectors = [
    '.s-result-item[data-asin]:not([data-asin=""])',
    '.a-carousel-card',
    '[data-cel-widget*="pd_rd_w"]',
    '.a-section.a-spacing-none.s-padding-right-small.s-title-instructions-style',
  ];

  // Función para obtener los datos del producto
  function getProductData(element) {
    const titleElement = element.querySelector('h2 a, h2 span, h2, #productTitle, .a-text-normal') ||
                        element.querySelector('.a-link-normal');
    const imageElement = element.querySelector('img');
    let productUrl = '';

    // Obtener URL del producto
    const linkElement = element.querySelector('a[href*="/dp/"], a[href*="/gp/product/"]');
    if (linkElement) {
      const href = linkElement.getAttribute('href');
      try {
        const url = new URL(href, window.location.origin);
        const asinMatch = url.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
        if (asinMatch) {
          productUrl = `${url.origin}/dp/${asinMatch[1]}`;
        } else {
          productUrl = url.href;
        }
      } catch (error) {
        console.error('URL inválida:', href);
      }
    }

    return {
      title: titleElement ? titleElement.textContent.trim() : '',
      image: imageElement ? imageElement.src : '',
      url: productUrl || window.location.href
    };
  }

  // Función para insertar botones en la página de producto
  function addButtonsToProductPage() {
    productPageSelectors.some(selector => {
      const container = document.querySelector(selector);
      if (container && !container.querySelector('.product-remider-buttons')) {
        const productData = {
          title: document.querySelector('#productTitle')?.textContent.trim() || '',
          image: document.querySelector('#landingImage')?.src || '',
          url: window.location.href
        };

        const buttonContainer = createSaveButton(container, productData);
        buttonContainer.classList.add('product-remider-buttons');

        // Insertar después del título en la página de producto
        const targetElement = container.querySelector('#productTitle') || container.firstChild;
        if (targetElement) {
          targetElement.parentNode.insertBefore(buttonContainer, targetElement.nextSibling);
          return true; // Detener la búsqueda si se insertaron los botones
        }
      }
      return false;
    });
  }

  // Función para insertar botones en la lista de productos
  function addButtonsToProductListing() {
    listingSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(productElement => {
        if (productElement.querySelector('.product-remider-buttons')) return;

        const productData = getProductData(productElement);
        if (!productData.title) return;

        const buttonContainer = createSaveButton(productElement, productData);
        buttonContainer.classList.add('product-remider-buttons');

        const titleElement = productElement.querySelector('h2 a, h2 span, h2') || 
                           productElement.querySelector('.a-text-normal');
        
        if (titleElement && titleElement.parentElement) {
          titleElement.parentElement.insertBefore(buttonContainer, titleElement);
        }
      });
    });
  }

  // Detectar si estamos en una página de producto o en un listado
  const isProductPage = window.location.pathname.includes('/dp/') || 
                       window.location.pathname.includes('/gp/product/');

  if (isProductPage) {
    addButtonsToProductPage();
  }
  
  // Siempre intentar añadir botones al listado por si hay productos relacionados
  addButtonsToProductListing();
}  

const styles = `
.product-remider-buttons {
  margin: 10px 0;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.product-remider-buttons button {
  padding: 5px 10px;
  border-radius: 3px;
  border: 1px solid #888;
  background: #f8f8f8;
  cursor: pointer;
}

.product-remider-buttons button:hover {
  background: #e8e8e8;
}
`;

// Ejecutar cuando la página carga
addButtonsToProducts();

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Ejecutar la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', addButtonsToProducts);
// También ejecutar cuando hay cambios en el DOM (para contenido dinámico)
const observer = new MutationObserver(addButtonsToProducts);
observer.observe(document.body, { childList: true, subtree: true });