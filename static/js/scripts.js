/* clears orders (and by extension local storage) */
function clearOrders()
{
    localStorage.clear();
    document.querySelectorAll('order').forEach(order => order.remove());
    if (document.getElementsByTagName("order").length < 1)
    {
        var basket_empty = document.getElementById("basket-empty");
        basket_empty.style.display = "block";
        var basket_price = document.getElementById("basket-price");
        basket_price.style.display = "none";
    }
}

/* reloads the orders after page reload or refresh */
function fillOrders()
{
    console.log(localStorage);
    if(localStorage.length == 0)
    {        /* do nothing */    }
    else
    {
        let stored_keys = Object.keys(localStorage).filter(k => k.startsWith('Ó'));
        for(var i = 0; i < stored_keys.length; i++)
        {
            var title = stored_keys[i].substring(1);
            console.log(title);
            if(!(document.getElementById(title)))
            {
                console.log(document.getElementById(title));
                addPizzaElement(document.getElementById(title), localStorage.getItem(stored_keys[i]));
            }
        }
    }
}

/* listing available pizzae in the menu */
function listPizzae()
{
    var newDiv = null;
    
    fetch('https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json')
    .then(response => response.json())
    .then(data => 
        data.forEach(pizza => {
            newDiv = document.createElement("pizza");
            newDiv.setAttribute("id", pizza.title);
            var ingredients1 = "";
            pizza.ingredients.forEach(ingredient =>
                {
                    ingredients1 = ingredients1 + ingredient + ", ";
                }
            );
            ingredients1 = ingredients1.slice(0,-2)
            newDiv.innerHTML = '<img src="'+pizza.image+'">'
                +'<div class="title-price"><div class="title">'+pizza.title+'</div>'
                +'<div class="price">'+(pizza.price).toLocaleString("pl-PL")+'0 zł</div></div>'
                +'<ingr>'+ingredients1+'</ingr>'
                +'<button onClick="addPizzaButton(this);calculateOrders()">Zamów</button>';
            document.getElementById("pizzae").appendChild(newDiv);
        }))
        .then(fillOrders());
}

/* adds a div with pizza to the orders */
/* the arguments are: the menu <pizza> element, and how many pizzae of this kind is being ordered */
function addPizzaElement(pizza, count)
{
    var title = pizza.querySelector("div.title-price div.title").innerHTML;
    var price = pizza.querySelector("div.title-price div.price").innerHTML;
        let newDiv = document.createElement("order");
        newDiv.setAttribute("id", "Ó"+title);
        newDiv.innerHTML = '<div class="order-title">'+title+'</div>'
            + '<div class="order-price">'+price+'</div>'
            + '<div class="order-count">' +count+ '</div>'
            + '<div class="order-delete" onClick="removePizzaElement(this);calculateOrders()">×</div>';
        document.getElementById("orders").appendChild(newDiv);
        if(!!document.getElementById("basket-empty"))
        {
            var basket_empty = document.getElementById("basket-empty");
            basket_empty.style.display = "none";
            var basket_price = document.getElementById("basket-price");
            basket_price.style.display = "block";
        }
}

/* adds a pizza from the button in menu to the orders */
function addPizzaButton(button)
{
    
    //const basket = document.getElementById("orders");
    
    //var title = button.parentNode.querySelector("div.title-price div.title").innerHTML;
    //var price = button.parentNode.querySelector("div.title-price div.price").innerHTML;
    var title = button.parentNode.id;
    var count = 1;
    if(!(document.getElementById("Ó"+title)))
    {
        addPizzaElement(button.parentNode, count);
        localStorage.setItem("Ó"+title, 1);
    }
    else
    {
        var count = document.getElementById("Ó"+title).querySelector("div.order-count").innerHTML;
        count++;
        document.getElementById("Ó"+title).querySelector("div.order-count").innerHTML = count;
        localStorage.setItem("Ó"+title, count);
    }
}

/* removes one piece of pizza from the orders */
function removePizzaElement(button)
{
    var count = parseInt(button.parentNode
        .querySelector("div.order-count").innerHTML);
    count--;
    button.parentNode.querySelector("div.order-count").innerHTML = count;
    if (!count)
    {
        let order = button.parentNode;
        order.parentNode.removeChild(order);
        localStorage.removeItem(order);
        if (document.getElementsByTagName("order").length < 1)
        {
            var basket_empty = document.getElementById("basket-empty");
            basket_empty.style.display = "block";
            var basket_price = document.getElementById("basket-price");
            basket_price.style.display = "none";
        }
    }
    else
    {
        localStorage.setItem(button.parentNode.id,count);
    }
}


/* calculating the total cost of the orders */
function calculateOrders()
{
    var total_price = 0;
    var a, b;
    var prices = document.getElementsByClassName("order-price");
    var counts = document.getElementsByClassName("order-count");
    for (let index = 0; index < prices.length; index++) 
    {
        a = parseFloat(prices[index].innerHTML.replace(",",".").replace(" zł",""));
        b = parseInt(counts[index].innerHTML);
        total_price = total_price + a*b;
    }
    document.getElementById("basket-price-number").innerHTML = total_price.toFixed(1).replace(".",",")+"0 zł";
}