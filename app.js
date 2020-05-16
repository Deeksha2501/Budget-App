//BUDGET CONTROLLER
var budgetController = function () {

    var Expense = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value,
            this.percentage = -1
            
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    };

    //Getting data from localStorage/creating Architecture
    let data = localStorage.getItem('data') ? JSON.parse(localStorage.getItem('data')) : {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var data = budgetController.readStorage();
        var sum = 0;
        data.allItems[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.total[type] = sum;
        budgetController.persistData(data);
    }

    return {

        addItem: function (type, des, val) {
            var newItem, ID;

            //Pull data from local Storage
            data = budgetController.readStorage();

            //create a new id
            if (data.allItems[type].length > 0) {
                var index = data.allItems[type].length - 1;
                ID = data.allItems[type][index].id + 1;
            }
            else {
                ID = 0;
            }

            //create a new item based on the type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem);
            budgetController.persistData(data);


            return newItem;
        },

        //store data in local storage
        persistData: (data) => {

            localStorage.setItem('data', JSON.stringify(data));

        },

        //retrieve stored data
        readStorage: () => {
            const storage = JSON.parse(localStorage.getItem('data'));
            if (storage) data = storage;
            return data;
        },

        calcBudget: function () {
            //1. Calculate totals of income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Pulling data from localStorage
            var data = budgetController.readStorage();

            //2. Calculate the budget (Income-expense)
            data.budget = data.total['inc'] - data.total['exp'];

            //3. Calculate the percentage
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }
            //pushing it back
            budgetController.persistData(data);

        },

        getBudget: function () {
            var data = budgetController.readStorage();
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            }

        },

        deteteItem: function (type, id) {
            var ids, index, data;

            data = budgetController.readStorage();
            var ids = data.allItems[type].map(function (curr) {
                return curr.id;
            });

            //console.log(ids);
            index = ids.indexOf(parseFloat(id));
            //console.log(index);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            budgetController.persistData(data);


        },

        calculatePercentage: function () {
            var data = budgetController.readStorage();
            var totalIncome = data.total.inc;

            data.allItems.exp.forEach(function(cur) {
                if ( totalIncome > 0) {
                    cur.percentage = Math.round((cur.value / totalIncome) * 100);
                } else {
                    cur.percentage = -1;
                }
             });
            budgetController.persistData(data);
        },

        getPercentages: function () {
            var data = budgetController.readStorage();
            var allPers = data.allItems.exp.map(function (curr) {
                return curr.percentage;
            });
            return allPers;
        },

        testing: function () {
            console.log(data);
        }
    }

}();


//UI CONTROLLER
var UIController = function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeCont: '.income__list',
        expenseCont: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel :  '.item__percentage',
        dateLabel : '.budget__title--month'

    };

    var formatNum = function(num , type){
        var numSplit , int , dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        dec = numSplit[1];
        int = numSplit[0];

        if(int.length > 3){
           int = int.substr(0 , int.length-3) + ',' + int.substr(int.length-3 , 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach= function(list , callback){
        for(var i=0 ; i<list.length ; i++){
            callback(list[i] , i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHTML, element;

            //create html string
            if (type === 'inc') {
                element = DOMstrings.incomeCont;

                var html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseCont;

                var html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"><i></button></div></div></div>'
            }
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNum(obj.value , type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        renderData: function (data) {

            for (var i = 0; i < data.allItems['exp'].length; i++) {
                var obj = data.allItems['exp'][i];
                element = DOMstrings.expenseCont;
                var html, newHTML;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"><i></button></div></div></div>'

                newHTML = html.replace('%id%', obj.id);
                newHTML = newHTML.replace('%description%', obj.description);
                newHTML = newHTML.replace('%value%', formatNum(obj.value , 'exp'));

                document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            }
            for (var i = 0; i < data.allItems['inc'].length; i++) {
                var obj = data.allItems['inc'][i];
                element = DOMstrings.incomeCont;
                var html, newHTML;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

                newHTML = html.replace('%id%', obj.id);
                newHTML = newHTML.replace('%description%', obj.description);
                newHTML = newHTML.replace('%value%', formatNum(obj.value , 'inc'));

                document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
            }


        },

        clearFields: function () {
            var fields = document.querySelectorAll(DOMstrings.inputDescription + ' , ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (curr, index, array) {
                curr.value = "";
            });
            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNum(obj.budget , type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNum(obj.totalInc , 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNum(obj.totalExp , 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayPercentage : function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields , function(current , index){
                if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
            }else{
                current.textContent = "---"
            }
            });

        },

        displayMonth : function(){
            var month , now , year;
            var monthArr = ['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'October' , 'November' , 'December']

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = monthArr[month] + ' ' +  year;

        },

        changedType : function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOMstrings;
        }
    };


}();

//GLOBAL APP CONTROLLER
var controller = function (budgetCtrl, UICtrl) {


    //Setting up our Event Listening Function
    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', CtrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                CtrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', CtrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change' , UICtrl.changedType);
    };

    var updateBudget = function () {

        //1.Update the budget
        budgetCtrl.calcBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display it to User Interface
        UICtrl.displayBudget(budget);
    };

    updatePercentage = function () {
        //1. Calculate percentage
        budgetCtrl.calculatePercentage();

        //2. Read percentage from budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update UI
        UICtrl.displayPercentage(percentages);
    };

    var CtrlDeleteItem = function (event) {
        var itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID;
            splitID = itemID.split('-');
            type = splitID[0];
            id = splitID[1];

            //1. Remove an item from data structure
            budgetCtrl.deteteItem(type, id);

            //2. Delete an item from ui
            UICtrl.deleteListItem(itemID);

            //3.Update and show budget
            updateBudget();

            //4. Update the percetage
            updatePercentage();

        }
    };

    var CtrlAddItem = function () {

        //1. Get the input from fields
        var input = UICtrl.getInput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add the new item to the data
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and Update the budget
            updateBudget();
            updatePercentage();
        }

    }

    return {
        init: function () {
            console.log("Application has Started..");

            //Pulling the data from localStorage
            var data = budgetCtrl.readStorage();
            var budget = budgetCtrl.getBudget();

            //Rendering the Previous Data
            UICtrl.renderData(data);

            //Displaying Budget
            UICtrl.displayBudget(budget);

            updatePercentage();

            UICtrl.displayMonth();

            //Event Listeners
            setupEventListeners();
        }
    }

}(budgetController, UIController);

controller.init();

