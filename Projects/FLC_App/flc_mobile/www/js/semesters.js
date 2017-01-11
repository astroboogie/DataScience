import $ from 'jquery';

const setSemesterValues = function(form, semesters) {
    $(form + ' *').filter(':input').each(function(index, element){
        element.value = semesters[index]["endpoint"]
        $(element).parent().find($(".span-object > span")).text(semesters[index]["name"]);
    });
}

export { setSemesterValues };
