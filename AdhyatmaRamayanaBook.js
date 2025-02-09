document.addEventListener("DOMContentLoaded", function () {
  const url = 'DharmicData/Ramayanas/AdhyatmaRamayanaBook.pdf';

  let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    isEditing = false;

  const scale = 1,
    container = document.querySelector('#the-svg');

  // Render the page
  const renderPage = num => {
    pageIsRendering = true;

    // Get page
    pdfDoc.getPage(num).then(page => {
      // Set scale
      const viewport = page.getViewport({ scale });

      // Ensure that the SVG container is created before setting attributes
      if (!container) {
        console.error('SVG container not found.');
        return;
      }

      // Set dimensions
      container.style.width = viewport.width + 'px';
      container.style.height = viewport.height + 'px';

      page.getOperatorList()
        .then(function (opList) {
          var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
          return svgGfx.getSVG(opList, viewport);
        })
        .then(function (svg) {
          container.innerHTML = ''; // Clear previous content
          container.appendChild(svg);
        });

      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }

      // Output current page (modified)
      document.querySelector('#page-num').textContent = displayPageNumber(num - 6); // Use the new function
    });

    // Helper function to display page numbers correctly
    function displayPageNumber(num) {
      const romanNumerals = { '-5': 'I', '-4': 'II', '-3': 'III', '-2': 'IV', '-1': 'V', '0': 'VI' };
      return num in romanNumerals ? romanNumerals[num] : num;
    }
  };

  // Check for pages rendering
  const queueRenderPage = num => {
    if (pageIsRendering) {
      pageNumIsPending = num;
    } else {
      renderPage(num);
    }
  };

  // Get Document
  pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages - 6;

    renderPage(pageNum);
  }).catch(err => {
    // Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, container);
    // Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
  });

  // Function to update the page number and trigger rendering
  const updateAndRenderPage = newPageNum => {
    newPageNum = Math.max(1, Math.min(newPageNum, pdfDoc.numPages));

    if (pageNum !== newPageNum) {
      pageNum = newPageNum;
      document.getElementById('page-num').textContent = pageNum - 6;
      queueRenderPage(pageNum);
    }
  };

  // Enable scrolling using the cursor and keys
  window.addEventListener('wheel', function (e) {
    const sensitivity = 0.1; // Adjust sensitivity
    const deltaY = e.deltaY * sensitivity;

    if (deltaY > 0) {
      // Scrolling down
      updateAndRenderPage(pageNum + 1);
    } else {
      // Scrolling up
      updateAndRenderPage(pageNum - 1);
    }
  });

  // Enable touch-based scrolling for mobile and tablet devices
  let touchStartY = 0;
  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  });

  window.addEventListener('touchend', function (e) {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    const touchSensitivity = 5; // Adjust touch sensitivity
    const deltaThreshold = window.innerHeight / touchSensitivity;

    if (deltaY > deltaThreshold) {
      updateAndRenderPage(pageNum - 1);
    } else if (deltaY < -deltaThreshold) {
      updateAndRenderPage(pageNum + 1);
    }
  });

  let touchStartX = 0;
  window.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  });

  window.addEventListener('touchend', function (e) {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    const touchSensitivity = 5; // Adjust touch sensitivity
    const deltaThreshold = window.innerWidth / touchSensitivity;

    if (deltaX > deltaThreshold) {
      updateAndRenderPage(pageNum - 1);
    } else if (deltaX < -deltaThreshold) {
      updateAndRenderPage(pageNum + 1);
    }
  });

  // Enable navigation using arrow keys and page keys
  window.addEventListener('keydown', function (e) {
    if (isEditing) {
      if (e.key === 'Enter') {
        isEditing = false;
        updatePageNum();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    } else {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        // Arrow Up, Arrow Left, or Page Up: Previous page
        e.preventDefault();
        updateAndRenderPage(pageNum - 1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
        // Arrow Down, Arrow Right, or Page Down: Next page
        e.preventDefault();
        updateAndRenderPage(pageNum + 1);
      }
    }
  });

  // Function to handle editing the page number
  const updatePageNum = () => {
    const inputElement = document.getElementById('page-num');
    const newPageNum = parseInt(inputElement.textContent, 10) + 6;

    if (!isNaN(newPageNum)) {
      updateAndRenderPage(newPageNum);
    } else {
      // If the entered page number is invalid, reset to the current page number
      inputElement.textContent = pageNum - 6;
    }
  };

  document.getElementById('page-num').addEventListener('click', function () {
    isEditing = true;
    this.textContent = ''; // Clear the content when clicked
  });

  document.getElementById('page-num').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      isEditing = false;
      updatePageNum();
      e.preventDefault();
    }
  });

  window.addEventListener('keydown', function (e) {
    if (isEditing) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
      }
    }
  });

  // Expose the updatePageNum function to the global scope
  window.updatePageNum = updatePageNum;
});
