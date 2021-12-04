
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
                +'<button onClick="addPizza(this);calculateOrders()">Zamów</button>';
            document.getElementById("pizzae").appendChild(newDiv);
        }));
}

function addPizza(e)
{
    var newDiv = null;
    const basket = document.getElementById("orders");
    var id = e.parentNode.id;
    var title = e.parentNode.querySelector("div.title-price div.title").innerHTML;
    var price = e.parentNode.querySelector("div.title-price div.price").innerHTML;
    var count = 1;
    if(!(document.getElementById("O"+id)))
    {
        newDiv = document.createElement("order");
        newDiv.setAttribute("id", "O"+title);
        newDiv.innerHTML = '<div class="order-title">'+title+'</div>'
            + '<div class="order-price">'+price+'</div>'
            + '<div class="order-count">' +count+ '</div>'
            + '<div class="order-delete" onClick="removePizza(this);calculateOrders()">×</div>';
        document.getElementById("orders").appendChild(newDiv);
        if(!!document.getElementById("basket-empty"))
        {
            var basket_empty = document.getElementById("basket-empty");
            basket_empty.style.display = "none";
            var basket_price = document.getElementById("basket-price");
            basket_price.style.display = "block";
        }
    }
    else
    {
        var count = document.getElementById("O"+id).querySelector("div.order-count").innerHTML;
        count++;
        document.getElementById("O"+id).querySelector("div.order-count").innerHTML = count;
    }
}
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
function removePizza(e)
{
    var count = parseInt(e.parentNode
        .querySelector("div.order-count").innerHTML);
    count--;
    e.parentNode.querySelector("div.order-count").innerHTML = count;
    if (!count)
    {
        let id = e.parentNode;
        id.parentNode.removeChild(id);
        if (document.getElementsByTagName("order").length < 1)
        {
            var basket_empty = document.getElementById("basket-empty");
            basket_empty.style.display = "block";
            var basket_price = document.getElementById("basket-price");
            basket_price.style.display = "none";
        }
    }
}