document.addEventListener('DOMContentLoaded', function () {
  const dropdown = document.querySelector('#product-form-template--18519344120027__featured_product_wiHCVn-custom-3');
  if (dropdown) {
    console.log('Dropdown found:', dropdown);

    const productForm = dropdown.closest('form');
    if (productForm) {
      productForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedOption = dropdown.value;
        const quantity = selectedOption === '2 scoops per day (3-month supply)' ? 2 : 1;
        const variantId = productForm.querySelector('input[name="id"]').value;

        const formData = {
          items: [
            {
              id: variantId,
              quantity: quantity,
              properties: {
                'Choose your supply:': selectedOption,
              },
            },
          ],
        };

        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('Product added to cart:', data);
            alert('Product added to cart!');
          })
          .catch((error) => {
            console.error('Error adding product to cart:', error);
            alert('Failed to add product to cart.');
          });
      });
    }
  } else {
    console.log('Dropdown not found!');
  }
});
