// https://docs.google.com/spreadsheets/d/e/2PACX-1vRK60uZgiy1R8M3cPPXm3B512GgWSXRZF7iheQpISowPZNXPH_sppVi1kFWbRaZdoaFteKrMkZAzL0P/pub?output=csv
import { csvParse } from "https://cdn.skypack.dev/d3-dsv@3";
import { createPostcard, renderPostcard, stamps, images, showModal } from "./script.mjs";

// get csv and parse it in browser
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRK60uZgiy1R8M3cPPXm3B512GgWSXRZF7iheQpISowPZNXPH_sppVi1kFWbRaZdoaFteKrMkZAzL0P/pub?output=csv';
const csv = await fetch(csvUrl).then(response => response.text());
const data = csvParse(csv);

// get the gallery container
const gallery = document.querySelector('#gallery');



// create a postcard renderer
const { canvas, ctx } = createPostcard();
canvas.style.display = 'none';

// for (let i=0;i<10;i++) {
// create a card for each row in the csv
data
    // randomize the order of the rows
    .sort((a, b) => Math.random() - 0.5)
    .forEach(row => {
        if (row?.Remove.toLowerCase() === 'yes') {
            console.log('Skipping row', row);
            return
        }
        if (!row.JSON) return;
        try {
            row = JSON.parse(row.JSON);
        } catch (e) {
            console.error('Error parsing JSON', row.JSON);
            return;
        }
        if (!row.message?.trim()) return;

        if (shouldHide(row.message)) return

        console.log('Rendering row', row);
        const formdata = new FormData();
        formdata.append('prompt', row.prompt);
        formdata.append('image', row.image);
        formdata.append('message', row.message);
        formdata.append('signed', row.signed);
        formdata.append('stamp', row.stamp || 'WATU');

        // render the postcard
        renderPostcard(formdata, ctx, { stamps, images });
        // append the postcard to the gallery
        const img = new Image();
        img.src = canvas.toDataURL();
        gallery.appendChild(img);

        // when image is clicked, open its dataurl in a new tab
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            const detailEl = document.getElementById('gallery-detail'); 
            detailEl.getElementsByTagName('img')[0].src = img.src;
            showModal(detailEl);
            // const win = window.open();
            // win.document.write(`<img src="${img.src}">`);
        });
        // add id to the image
        img.id = row.submission_id
    });
// }

// remove the loading spinner id="gallery-loading"
document.querySelector('#gallery-loading').remove();



function shouldHide(message) {
    const hidewords = [
        'communist',
        'socialist',
        'lazy',
        'privliged',
    ]
    for (const bad of hidewords) {
        if (message.toLowerCase().includes(bad)) {
            return true
        }
    }
    return false
}
