
export default function generate(state) {
  let report = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

      <!-- Bootstrap CSS -->
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
      <style>
        h1 { padding-bottom: 1em; border-bottom: 1px solid rgb(220, 220, 220); }
        h3 { padding-top: 0.5em; padding-bottom: 0.2em; }
        img { 
          max-width: 65%!important;
          border: 1px solid rgba(1,1,1,0.2);
          border-radius: 4px;
          box-shadow: 2px 2px 2px #d2d2d3;
        }
        pre {
          padding-top: 1em;
          padding-bottom: 1em;
          padding-left: 0.5em;
          color: white;
          background-color: #212529;
          border-radius: 4px;
        }
      </style>
    </head>
    <body style="width: 80%; margin: auto;">
      <h1>${state.repository} ${state.tag.name}</h1>

      <h2>Index</h2>
      <ul>
      ${state.prs.map(pr => {
        return `<li>[${pr.number}]&nbsp;<a href="#${pr.number}">${pr.title}</a></li>`
      }).join('\n')} 
      </ul>

      <h2>Changes</h2>
  `
  state.prs.forEach(pr => {
    if (pr.bodyHTML) {
      report += `
        <a name="${pr.number}" />
        <h3><a href="${pr.url}">[${pr.number}]</a>&nbsp;${pr.title}</h3>
          ${pr.bodyHTML}
        <hr/>
      `
    }
  })

  report += `
      <!-- Optional JavaScript -->
      <!-- jQuery first, then Popper.js, then Bootstrap JS -->
      <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></script>
    </body>
  </html>
  `
  return report
}