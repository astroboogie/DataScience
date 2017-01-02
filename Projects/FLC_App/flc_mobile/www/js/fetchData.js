import $ from 'jquery';

const fetchData = function(endpoint) {
    let url = "https://s3-us-west-1.amazonaws.com/flc-app-data/" + endpoint + ".json";
    return $.ajax({
        url: url,
        type: "GET",
    });
}

export { fetchData };
