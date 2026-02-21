const input = document.getElementById('ingredientInput');
        const addBtn = document.getElementById('addBtn');
        const list = document.getElementById('ingredientList');
        const generateBtn = document.getElementById('generateRecipeBtn');

        addBtn.addEventListener('click', () => {
            const value = input.value.trim();
            if (value !== "") {
                addIngredient(value);
                input.value = ''; 
            }
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                addBtn.click();
            }
        });

        function addIngredient(name) {
            const emptyMsg = list.querySelector('.empty-state');
            if(emptyMsg) emptyMsg.remove();

            const li = document.createElement('li');
            li.textContent = name + " ";
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'x';
            removeBtn.className = 'remove-btn';
            
            removeBtn.onclick = function() {
                li.remove();
            };

            li.appendChild(removeBtn);
            list.appendChild(li);
        }

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.onclick = function() {
                this.parentElement.remove();
            };
        });

        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                const ingredients = [];
                const listItems = list.querySelectorAll('li');
                
                listItems.forEach(li => {
                    // Extract text content, ignoring the button element inside the li
                    let text = '';
                    li.childNodes.forEach(node => {
                        if (node.nodeType === 3) { // Node.TEXT_NODE
                            text += node.textContent;
                        }
                    });
                    const trimmed = text.trim();
                    if (trimmed) ingredients.push(trimmed);
                });

                if (ingredients.length === 0) {
                    alert('Please add ingredients first.');
                    return;
                }

                // Create a hidden form to submit the ingredients to the server
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/get-recipes';
                form.style.display = 'none';

                ingredients.forEach(ing => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'ingredients';
                    input.value = ing;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            });
        }

        // Handle image upload form to preserve existing ingredients
        const uploadForm = document.querySelector('form[action="/analyze-image"]');
        if (uploadForm) {
            uploadForm.addEventListener('submit', function() {
                const listItems = list.querySelectorAll('li');
                listItems.forEach(li => {
                    // Extract text content, ignoring the button element inside the li
                    let text = '';
                    li.childNodes.forEach(node => {
                        if (node.nodeType === 3) { // Node.TEXT_NODE
                            text += node.textContent;
                        }
                    });
                    const trimmed = text.trim();
                    if (trimmed) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'existingIngredients';
                        input.value = trimmed;
                        this.appendChild(input);
                    }
                });
            });
        }