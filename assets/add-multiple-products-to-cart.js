document.addEventListener('DOMContentLoaded', function () {
  // Select the dropdown using its name attribute
  const dropdown = document.querySelector('select[name="properties[Choose your supply:]"]');
  
  if (dropdown) {
    console.log('Dropdown found:', dropdown);

    // Get the form containing the dropdown
    const productForm = dropdown.closest('form');
    if (productForm) {
      productForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get the selected option from the dropdown
        const selectedOption = dropdown.value;

        // 90 scoops/tub; "3-month supply" = 90 days.
        // 2 scoops/day -> 180 scoops -> 2 tubs; otherwise 1 tub.
        const quantity = selectedOption === '2 scoops per day (3-month supply)' ? 2 : 1;

        // Get the product variant ID
        const variantId = productForm.querySelector('input[name="id"]').value;

        // Prepare the data for the AJAX request
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

        // Send the AJAX request to Shopify's /cart/add.js endpoint
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
