var data_path = "./data.json";
var data = {};
var user_cards = {}; // initialised in init()
var agency_scores = [];

var [PRIMARY_5, SECONDARY_5] = [45, 30];
var [PRIMARY_4, SECONDARY_4] = [39, 26];

$( document ).ready(function() {
	init(function(){
		load_agency_scores();
		load_user_cards(); // load any cards that are in storage
		render_data_list(); // populate the datalist with names of all cards
		events();		
	});
});

function init(callback){
	function continue_init(_data){
		data = _data;
		user_cards.data = [];
		user_cards.add = function(x){
			this.data.push(x);
		}
		user_cards.last_card = function(){
			let len = this.data.length;
			if (len == 0){
				return 0;
			} else if (len == 1){
				return this.data[0];
			} else {
				return this.data[this.data.length-1];
			}
		}
		user_cards.last_index = function(){
			let len = this.data.length;
			if ( len == 0 ) return 0;
			return len - 1;
		}
	}

	// entry point as getJSON is async
	$.getJSON( "https://raw.githubusercontent.com/Amaazing/amaazing.github.io/master/script/card_data.json", function( _data ) {
		continue_init(_data);
		callback();
	});
}


function load_user_cards(){
	function _populate_select_options(){
		$.each($(".card_slection_add"), function(i, selection){
			user_cards.data.forEach( (card, i) => {
				let option_name = `[${card['star']}][${card['character'].toUpperCase()}] ${card['card']}`;
				selection.append(new Option(option_name, i));
			});
		});
		
	}

	function _render_user_cards(){
		user_cards.data.forEach((card) => _make_row(card));
	}

	let _user_cards = window.localStorage.getItem("cards");
	if (_user_cards === null) return;

	user_cards.data = JSON.parse(_user_cards); // add to global var

	// add options to select tag to pick a card from storage
	_render_user_cards();
	_populate_select_options();
}

function load_agency_scores(){
	let _agency_scores = window.localStorage.getItem("agency");
	if (_agency_scores === null) return;
	agency_scores = JSON.parse(_agency_scores);
	$("#empathy0, #agencyLevels .empathy > label").text(agency_scores[0]);
	$("#passion0, #agencyLevels .passion > label").text(agency_scores[1]);
	$("#stamina0, #agencyLevels .stamina > label").text(agency_scores[2]);
	$("#wisdom0, #agencyLevels .wisdom > label").text(agency_scores[3]);
}

function render_data_list(){
	let datalist = document.getElementById("cards_list_names");
	let str = "";

	Object.keys(data).forEach( (star) => {
		Object.keys(data[`${star}`]).forEach( (character) => {
			data[`${star}`][`${character}`].forEach( (card, i) => {
				// console.log(card['card']);
				let card_name = card['card'];
				str += `<option 
					value="[${star}][${character.toUpperCase()}] ${card_name}"
					name="${character}"
					character="${character}"
					star="${star}"
					i=${i}
					>\n`;
			});
		});
	});

	datalist.innerHTML = str;	
}

function events(){
	$( "#addCardSubmit" ).click(function(e) {
		e.preventDefault();
		update_user_cards_view();
		update_select_options();
	});

	$( "select.card_slection_add" ).change(function(e){
		window.cat = e;
		let card = $(e.currentTarget).children("option:selected")[0];
		let card_id = $(e.currentTarget).parent().parent()[0].id
		let empathy_label = $(`#${card_id} .empathy`);
		let passion_label = $(`#${card_id} .passion`);
		let stamina_label = $(`#${card_id} .stamina`);
		let wisdom_label = $(`#${card_id} .wisdom`);

		let empathy_base_value = user_cards.data[card.value]["empathy"];
		let passion_base_value = user_cards.data[card.value]["passion"];
		let stamina_base_value = user_cards.data[card.value]["stamina"];
		let wisdom_base_value = user_cards.data[card.value]["wisdom"];
		let primary_stat = user_cards.data[card.value]["primary"];
		let star = user_cards.data[card.value]["star"];

		let input = $(`#${card_id} input`)[0];

		empathy_label.text(empathy_base_value);
		passion_label.text(passion_base_value);
		stamina_label.text(stamina_base_value);
		wisdom_label.text(wisdom_base_value);

		input.disabled = false;
		$(input).change(function (e){
			let labels = [empathy_label, passion_label, stamina_label, wisdom_label];
			let base_stats = [empathy_base_value, passion_base_value, stamina_base_value, wisdom_base_value];
			let level = e.currentTarget.value;
			let PRIMARY, SECONDARY;
			if (star == 4) [PRIMARY, SECONDARY] = [PRIMARY_4, SECONDARY_4]
			else [PRIMARY, SECONDARY] = [PRIMARY_5, SECONDARY_5]

 			for (var i = 0; i < labels.length; i++) {
				let FACTOR = i === (primary_stat-1) ? PRIMARY : SECONDARY
				labels[i].text(base_stats[i] + ((level-1) * FACTOR));
			}
		});

	});

	$("#clear").click(function(e){
		e.preventDefault();
		window.localStorage.removeItem("cards");
		document.location.reload();
	});

	$("#agencyLevels input, #card0 input").change(function(e){
		let level = e.currentTarget.value;
		let label = $(e.currentTarget).parent().children("label")
		let score = 87 + (level * 13);
		label.text(score);
	});

	$("#agencyLevelsSubmit").click(function(e){
		e.preventDefault();
		let empathy = parseInt($("#agencyLevels .empathy > label").text());
		let passion = parseInt($("#agencyLevels .passion > label").text());
		let stamina = parseInt($("#agencyLevels .stamina > label").text());
		let wisdom = parseInt($("#agencyLevels .wisdom > label").text());

		let scores = [empathy, passion, stamina, wisdom];

		window.localStorage.setItem("agency", JSON.stringify(scores));
		agency_scores = scores;

		$("#empathy0").text(empathy);
		$("#passion0").text(passion);
		$("#stamina0").text(stamina);
		$("#wisdom0").text(wisdom);
	});
}

function _make_row(card){
	let cell_count = 0;
	let _table = document.querySelector("#userCards table");
	let row = _table.insertRow(-1);

	let star = row.insertCell(cell_count++);
	let character = row.insertCell(cell_count++);
	let primary = row.insertCell(cell_count++);
	let name = row.insertCell(cell_count++);
	let empathy = row.insertCell(cell_count++);
	let passion = row.insertCell(cell_count++);
	let stamina = row.insertCell(cell_count++);
	let wisdom = row.insertCell(cell_count++);

	star.innerHTML = card['star'];
	character.innerHTML = card['character'];
	primary.innerHTML = card['primary'];
	name.innerHTML = card['card'];
	empathy.innerHTML = card['empathy'];
	passion.innerHTML = card['passion'];
	stamina.innerHTML = card['stamina'];
	wisdom.innerHTML = card['wisdom'];
}

function update_select_options(){
	let last_card = user_cards.last_card();
	let card_i = user_cards.last_index();
	let name = `[${last_card['star']}][${last_card['character'].toUpperCase()}] ${last_card['card']}`;
	$.each($(".card_slection_add"), function (i, select){
		select.append(new Option(name, card_i));
	});
}

function update_user_cards_view(){
	function update_cards_view(){
		_make_row(user_cards.last_card());
	}

	let empathy = parseInt($("input#empathy")[0].value);
	let passion = parseInt($("input#passion")[0].value);
	let stamina = parseInt($("input#stamina")[0].value);
	let wisdom = parseInt($("input#wisdom")[0].value);
	let level = parseInt($("input#level")[0].value);

	let card_seletion = $("input#card_slection_names")[0].value;
	let card_option = $('datalist#cards_list_names option').filter(function(){return this.value === card_seletion});
	let star = $(card_option).attr("star");
	let character = $(card_option).attr("character");
	let card = data[`${star}`][`${character}`][`${card_option.attr("i")}`];
	let primary = card['primary'];

	if (level > 1){
		let stats = [empathy, passion, stamina, wisdom];
		let PRIMARY, SECONDARY;

		if (star == 4) [PRIMARY, SECONDARY] = [PRIMARY_4, SECONDARY_4]
		else [PRIMARY, SECONDARY] = [PRIMARY_5, SECONDARY_5]

		for (var i = 0; i < stats.length; i++) {
			let FACTOR = i === (primary-1) ? PRIMARY : SECONDARY
			stats[i] -= ((level-1) * FACTOR);
		}

		empathy = stats[0];
		passion = stats[1];
		stamina = stats[2];
		wisdom = stats[3];
	}

	card['empathy'] = empathy;
	card['passion'] = passion;
	card['stamina'] = stamina;
	card['wisdom'] = wisdom;
	card['star'] = star;
	card['character'] = character;
	card['primary'] = primary;


	user_cards.add(card);
	update_cards_view();
	window.localStorage.setItem("cards", JSON.stringify(user_cards.data));
}
