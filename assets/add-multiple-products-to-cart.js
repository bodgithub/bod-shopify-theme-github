document.addEventListener('DOMContentLoaded', function () {
  // Check if the supply dropdown is present on the page
  const supplyDropdown = document.querySelector(
    'select[name="properties[Choose your supply:]"]'
  );

  if (supplyDropdown) {
    // Attach an event listener to the form containing the dropdown
    const productForm = supplyDropdown.closest('form');

    if (productForm) {
      productForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the selected value from the dropdown
        const selectedOption = supplyDropdown.value;

        // Determine the quantity based on the dropdown value
        let quantity = 1;
        if (selectedOption === '2 scoops per day (3-month supply)') {
          quantity = 2;
        }

        // Get the product variant ID from the hidden input field in the form
        const variantId = productForm.querySelector('input[name="id"]').value;

        // Prepare the data for the AJAX request
        const formData = {
          items: [
            {
              id: variantId,
              quantity: quantity,
              properties: {
                'Choose your supply:': selectedOption, // Pass the dropdown value as a line item property
              },
            },
          ],
        };

        // Send the AJAX request to Shopify's cart API
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
            // Optionally redirect to the cart page or update a cart drawer
          })
          .catch((error) => {
            console.error('Error adding product to cart:', error);
            alert('Failed to add product to cart.');
          });
      });
    }
  }
});
