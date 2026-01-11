let hasChosenImport = false; // flag to control flow
      let pageIndex = -1;
      let drawing = false; // flag to know if mouse is pressed
      let currentStroke = null; // current line being drawn
      let drawingData = []; // ALL drawing strokes of this page
      let redoStack = [];

      let pageNames = [];
      let pensize = 2;
      let notebookExpandedOnce = false;
      document.addEventListener("DOMContentLoaded", () => {
        if (!hasChosenImport) {
          // Hide main UI until decision is made
          document.getElementById("bookmarkForm").style.display = "none";
          document.getElementById("bookmarkList").style.display = "none";
        }
      });

      let correctPassword =
        localStorage.getItem("pagePassword") || "MyBook123";

      const userPassword = prompt("Enter the password to access this page:");
      if (userPassword !== correctPassword) {
        document.body.innerHTML =
          "<h1 style='color:red;text-align:center;margin-top:20vh;'>Access Denied</h1>";
        throw new Error("Access denied");
      }
      document.addEventListener("DOMContentLoaded", function () {
        const canvas = document.getElementById("pagesCanvas");
        const ctx = canvas.getContext("2d");

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        canvas.addEventListener("mousedown", (e) => {
          drawing = true;
          const rect = canvas.getBoundingClientRect();
          currentStroke = {
            color: document.getElementById("PenColorPicker").value,
	    size: pensize,
            points: [{ x: e.clientX - rect.left, y: e.clientY - rect.top }],
          };
        });

        canvas.addEventListener("mousemove", (e) => {
          if (!drawing || !currentStroke) return;
          const rect = canvas.getBoundingClientRect();
          const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          const lastPoint = 
            currentStroke.points[currentStroke.points.length - 1];

          ctx.strokeStyle = currentStroke.color;
          ctx.lineWidth = currentStroke.size;
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();

          currentStroke.points.push(point);
        });

        canvas.addEventListener("mouseup", () => {
  if (currentStroke) {
    drawingData.push(currentStroke);
    redoStack = []; // clear redo history after new stroke
    currentStroke = null;
  }
  drawing = false;
});


        const form = document.getElementById("bookmarkForm");

        function updateVisitCount(url) {
          let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
          let bookmark = bookmarks.find((bookmark) => bookmark.url === url);
          if (bookmark) {
            bookmark.visits = (bookmark.visits || 0) + 1;
            localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
            loadBookmarks();
          }
        }
        form.addEventListener("submit", function (event) {
          event.preventDefault();
          let name = document.getElementById("bookmarkName").value;
          let url = document.getElementById("bookmarkURL").value;
          let image = document.getElementById("bookmarkImageURL").value || null;
          let bookmarks = JSON.parse(localStorage.getItem("bookmarks"));
	  if (!Array.isArray(bookmarks)) bookmarks = [];
	  bookmarks.push({ name, url, image, visits: 0 });
          localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

          loadBookmarks();
          form.reset();
        });

        const themeToggle = document.getElementById("themeToggle");

        // Check saved theme in localStorage
        if (localStorage.getItem("theme") === "light") {
          document.body.classList.add("light-mode");
          themeToggle.textContent = "🌙";
        }

        // Toggle theme on button click
        themeToggle.addEventListener("click", function () {
          document.body.classList.toggle("light-mode");
          if (document.body.classList.contains("light-mode")) {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌙";
          } else {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "🌞";
          }
        });
      });
      function loadBookmarks() {
        let rawData = JSON.parse(localStorage.getItem("bookmarks")) || [];

        // Sanitize data
        let bookmarks = rawData.map((b) => ({
          name: b.name?.trim() || "Unnamed",
          url: b.url?.trim() || "#",
          image: b.image?.trim() || "",
          visits: typeof b.visits === "number" ? b.visits : 0,
          marked: !!b.marked, // NEW
        }));

        bookmarks.sort((a, b) => {
          // Priority 1: Important (marked) bookmarks come first
          if (a.marked && !b.marked) return -1;
          if (!a.marked && b.marked) return 1;

          // Priority 2: Within each group, sort by visit count descending
          return (b.visits || 0) - (a.visits || 0);
        });

        bookmarkList.innerHTML = "";

        bookmarks.forEach(({ name, url, image, visits }, index) => {
          let listItem = document.createElement("li");

          let img = document.createElement("img");
          img.src =
            image ||
            "data:image/jpeg;base64,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";
          img.alt = "Bookmark Image";
          img.onerror = function () {
            this.src =
              "data:image/jpeg;base64,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";
          };

          let link = document.createElement("a");
          link.href = url;
          link.textContent = name;
          link.target = "_blank";
          link.title = name; // show full text on hover
          link.onclick = function () {
            updateVisitCount(url);
          };

          let visitCount = document.createElement("span");
          visitCount.textContent = `${visits}`;
          visitCount.style.color = "#000000";
          visitCount.style.fontSize = "2.2vh";

          let signalButton = document.createElement("button");
          signalButton.classList.add("green-signal-button");
          if (!bookmarks[index].marked) {
            signalButton.classList.add("unmarked");
          }

          const iconImg = document.createElement("img");
          iconImg.src = bookmarks[index].marked
            ? "data:image/jpeg;base64,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" // ✅ path to your green signal image
            : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAA1BMVEX8/PwXpqfoAAAALElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgZViQAAd2fpbUAAAAASUVORK5CYII="; // ✅ path to your gray/unmarked icon
          iconImg.alt = "Important";
          iconImg.style.width = "4vh";
          iconImg.style.height = "4vh";
          signalButton.innerHTML = ""; // Clear existing
          signalButton.appendChild(iconImg);
          signalButton.title = bookmarks[index].marked
            ? "Mark as not important"
            : "Mark as important";
          signalButton.onclick = () => {
            bookmarks[index].marked = !bookmarks[index].marked;
            localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
            loadBookmarks(); // re-render with new class
          };

          // Options menu (unchanged)
          let dropdown = document.createElement("div");
          let dropdownContent = document.createElement("div");
          let renameBtn = document.createElement("button");
          let editBtn = document.createElement("button");
          let editlinkBtn = document.createElement("button");
          let copyBtn = document.createElement("button");
          let removeBtn = document.createElement("button");
          let dropdownBtn = document.createElement("button");

          renameBtn.textContent = "Rename";
          renameBtn.onclick = function () {
            let newName = prompt("Enter new bookmark name:", name);
            if (newName) {
              bookmarks[index].name = newName.trim();
              localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
              loadBookmarks();
            }
          };

          editBtn.textContent = "Edit Img";
          editBtn.onclick = function () {
            let newImg = prompt("Enter new image URL:", image);
            if (newImg) {
              bookmarks[index].image = newImg.trim();
              localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
              loadBookmarks();
            }
          };

          editlinkBtn.textContent = "Edit Link";
          editlinkBtn.onclick = function () {
            let newURL = prompt("Enter new URL:", url);
            if (newURL) {
              bookmarks[index].url = newURL.trim();
              localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
              loadBookmarks();
            }
          };

          copyBtn.textContent = "Copy Link";
          copyBtn.onclick = function () {
            navigator.clipboard.writeText(url);
            alert(`Copied: ${url}`);
          };

          removeBtn.textContent = "Remove";
          removeBtn.onclick = function () {
            bookmarks.splice(index, 1);
            localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
            loadBookmarks();
          };

          dropdown.classList.add("dropdown");
          dropdownContent.classList.add("dropdown-content");
          dropdownContent.append(
            renameBtn,
            editBtn,
            editlinkBtn,
            copyBtn,
            removeBtn
          );

          dropdownBtn.textContent = "Options";
          dropdownBtn.style.cursor = "pointer";
          dropdown.appendChild(dropdownBtn);
          dropdown.appendChild(dropdownContent);

          dropdownBtn.addEventListener("click", () => {
            listItem.innerHTML = ""; // Clear current tile content

            // Create editable fields
            const nameInput = document.createElement("input");
            nameInput.classList.add("edit-input");
            nameInput.value = name;
            nameInput.placeholder = "Bookmark name";

            const urlInput = document.createElement("input");
            urlInput.classList.add("edit-input");
            urlInput.value = url;
            urlInput.placeholder = "Bookmark URL";

            const imageInput = document.createElement("input");
            imageInput.classList.add("edit-input");
            imageInput.value = image;
            imageInput.placeholder = "Image URL";

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "💾";
            saveBtn.classList.add("edit-button");
            saveBtn.onclick = () => {
              bookmarks[index].name = nameInput.value.trim();
              bookmarks[index].url = urlInput.value.trim();
              bookmarks[index].image = imageInput.value.trim();
              localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
              changesMade = true; // if you're tracking unsaved changes
              loadBookmarks(); // Reload with updated data
            };

            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "❌";
            cancelBtn.classList.add("edit-button");
            cancelBtn.onclick = () => {
              loadBookmarks(); // Just reload the view without saving
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.classList.add("edit-button");
            deleteBtn.onclick = () => {
              bookmarks.splice(index, 1);
              localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
              changesMade = true;
              loadBookmarks();
            };

            const buttonRow = document.createElement("div");
            buttonRow.classList.add("button-row");
            buttonRow.append(saveBtn, cancelBtn, deleteBtn);

            listItem.append(nameInput, urlInput, imageInput, buttonRow);
          });

          document.addEventListener("click", () => {
            document
              .querySelectorAll(".dropdown-content")
              .forEach((d) => d.classList.remove("show"));
          });

          listItem.append(signalButton, img, link, visitCount, dropdown);
          bookmarkList.appendChild(listItem);
        });
      }
function exportData() {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  
  if (bookmarks.length === 0) {
    alert("No bookmarks to export!");
    return;
  }

  const dataStr = JSON.stringify(bookmarks, null, 2); // pretty print
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "bookmarks.json"; // filename
  document.body.appendChild(a); // needed for Firefox
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

      function changePagePassword() {
        const oldPassword = prompt("Enter current password:");
        if (oldPassword !== correctPassword) {
          alert("Wrong password! You cannot change it.");
          return;
        }

        const newPassword = prompt("Enter new password:");
        if (newPassword) {
          localStorage.setItem("pagePassword", newPassword);
          alert("Password changed! It will apply on next load.");
        }
      }
      function resetWebsite() {
        const confirmReset = confirm(
          "Are you sure you want to delete all bookmarks? This cannot be undone!"
        );
        if (confirmReset) {
          localStorage.removeItem("bookmarks"); // delete all saved bookmarks
          alert("All bookmarks have been deleted.");
          loadBookmarks(); // reload the page to reflect changes
        }
      }
      function triggerImport() {
        document.getElementById("importFile").click();
      }
      function skipImport() {
        hasChosenImport = true; // Set flag to true
        document.getElementById("importPrompt").style.display = "none";
        document.getElementById("bookmarkForm").style.display = "block";
        document.getElementById("bookmarkList").style.display = "flex";
        document.getElementById("heading").style.display = "inline";
        loadBookmarks(); // Load bookmarks after skipping import
      }
      document
        .getElementById("importFile")
        .addEventListener("change", function (event) {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const data = e.target.result;
              try {
                const bookmarks = JSON.parse(data);
                localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
                alert("Bookmarks imported successfully!");
                hasChosenImport = true; // Set flag to true
                document.getElementById("importPrompt").style.display = "none";
                document.getElementById("bookmarkForm").style.display = "block";
                document.getElementById("bookmarkList").style.display = "flex";
                document.getElementById("heading").style.display = "inline";
                loadBookmarks(); // Load bookmarks after import
              } catch (error) {
                alert(
                  "Failed to import bookmarks. Please check the file format."
                );
              }
            };
            reader.readAsText(file);
          }
        });

      function buttonshower() {
        if (!hasChosenImport) return;

        const optionsBtn = document.getElementById("brandlogoasbutton");
        optionsBtn.title = "Options Menu";
        const buttons = ["themeToggle", "reset", "ExportData", "password"];

        buttons.forEach((id) => {
          const el = document.getElementById(id);
          el.style.display = el.style.display === "inline" ? "none" : "inline";
        });
      }

      const pagesArea = document.getElementById("pagesArea");
      const pagesPanel = document.getElementById("pagesPanel");
      const pagesKey = "Savedpages";
      let Currentpage = null;

      // Retrieve all pages
      function GetAllpages() {
        return JSON.parse(localStorage.getItem(pagesKey)) || {};
      }

      const expandpagesButton = document.getElementById("expandpagesButton");
      const shrinkpagesButton = document.getElementById("shrinkpagesButton");
      let pagesExpanded = 0;
      const stepSize = 98.4;
      const maxSize = 98.4;


function shownotebooklogo() {
  const logo = document.getElementById("notebooklogo");
  logo.classList.add("animate");

  // Hide logo after 1 second
  setTimeout(() => {
    logo.classList.remove("animate");
  }, 10);
}

      function showNoteBookOverlayWithAnimation(duration = 2000) {
        const overlay = document.getElementById("notebookOverlay");
        overlay.style.display = "block";
        overlay.style.opacity = "1";

        shownotebooklogo();

        setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => {
            overlay.style.display = "none";
          }, 1000);
        }, duration);
      }

      // Expand Step-by-Step
      expandpagesButton.addEventListener("click", () => {
        pagesExpanded += stepSize;
        if (notebookExpandedOnce === false) {
          showNoteBookOverlayWithAnimation(2000);
        }
        if (pagesExpanded >= maxSize) {
          pagesExpanded = maxSize;
          expandpagesButton.style.display = "none";
        }
        setTimeout(() => {
          document.getElementById("shrinkpagesButton").style.display = "inline";
        }, 275); // show after 0.28 second

        pagesPanel.style.right = `-${maxSize - pagesExpanded}vw`;
        notebookExpandedOnce = true;
      });

      // Shrink Step-by-Step
      shrinkpagesButton.addEventListener("click", () => {
        pagesExpanded -= stepSize;
        if (pagesExpanded <= 0) {
          pagesExpanded = 0.6;
          shrinkpagesButton.style.display = "none";
        }
        setTimeout(() => {
          document.getElementById("expandpagesButton").style.display = "inline";
        }, 280); // show after 0.28 second
        pagesPanel.style.right = `-${maxSize - pagesExpanded}vw`;
      });

      // deletepage
      document.getElementById("Deletepage").addEventListener("click", () => {
        if (!Currentpage) return alert("No page selected to delete.");

        const Allpages = GetAllpages();
        if (Allpages[Currentpage]) {
          delete Allpages[Currentpage];
          localStorage.setItem(pagesKey, JSON.stringify(Allpages));
          pagesArea.innerText = "";
          drawingData = []; // clear drawing data
          ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

          Currentpage = null;
          updatepageNameDisplay();
          document.getElementById("prevpage").style.display = "none";
          document.getElementById("nextpage").style.display = "none";
          alert("page deleted successfully.");
        } else {
          alert("Selected page does not exist.");
        }
      });

      // New page
      document.getElementById("Newpage").addEventListener("click", () => {
        if (
          confirm(
            "Start a new page? This will automatically save the modifications done in the saved page."
          )
        ) {
          // Auto-save if there is a current page
          if (Currentpage) {
            const Allpages = GetAllpages();
            Allpages[Currentpage] = {
              Content: pagesArea.innerText,
              Password: Allpages[Currentpage]?.Password || null,
              DrawingData: drawingData, // ✅ Save the drawing strokes here
            };
            localStorage.setItem(pagesKey, JSON.stringify(Allpages));
          }

          pagesArea.innerText = "";
          drawingData = []; // clear drawing data
          ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

          Currentpage = null;
          updatepageNameDisplay();
        }
        document.getElementById("prevpage").style.display = "none";
        document.getElementById("nextpage").style.display = "none";
      });

      // Save page with Optional Password
      document.getElementById("Savepage").addEventListener("click", () => {
        const pageName = prompt(
          "Just enter a name for your temp page by which you want it to save in your NoteBook:"
        );
        if (!pageName) return;

        const Password = prompt(
          "Set a password (leave blank for no password):"
        );

        const Allpages = GetAllpages();

        if (Allpages[pageName]) {
          const overwrite = confirm(
            `page "${pageName}" already exists. Do you want to overwrite it?`
          );
          if (!overwrite) return;
          alert(`page "${pageName}" has been overwritten.`);
        }

        // Add or overwrite the page
        Allpages[pageName] = {
          Content: pagesArea.innerText,
          Password: Password ? Password.trim() : null,
          DrawingData: drawingData, // ⬅️ this saves your strokes
        };

        localStorage.setItem(pagesKey, JSON.stringify(Allpages));
        alert("page saved!");
        Currentpage = pageName;
        updatepageNameDisplay();
        pageNames = Object.keys(Allpages);
        pageIndex = pageNames.indexOf(pageName);
        document.getElementById("prevpage").style.display = "inline";
        document.getElementById("nextpage").style.display = "inline";
      });

      // Open Saved page
      document.getElementById("Openpage").addEventListener("click", () => {
        const Allpages = GetAllpages();
        const Names = Object.keys(Allpages);

        if (Names.length === 0) return alert("No saved pages found.");

        const Selected = prompt(
          `This is your NoteBook containing your pages enter page name which you want to open:\n${Names.join(
            "\n"
          )}`
        );
        if (!Selected || !Allpages[Selected]) return alert("page not found.");

        const page = Allpages[Selected];
        if (page.Password) {
          const EnteredPass = prompt("Enter password for this page:");
          if (EnteredPass !== page.Password) {
            return alert("Incorrect password!");
          }
        }

        pagesArea.innerText = page.Content;
        drawingData = page.DrawingData || []; // load saved strokes or empty

        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas first

        drawingData.forEach((stroke) => {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;

          for (let i = 1; i < stroke.points.length; i++) {
            const from = stroke.points[i - 1];
            const to = stroke.points[i];

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
          }
        });

        Currentpage = Selected;
        updatepageNameDisplay();
        pageNames = Object.keys(Allpages);
        pageIndex = pageNames.indexOf(Selected);

        document.getElementById("prevpage").style.display = "inline";
        document.getElementById("nextpage").style.display = "inline";
      });

      function loadpageAt(index) {
        const Allpages = GetAllpages();
        const Names = Object.keys(Allpages);

        if (index < 0 || index >= Names.length) {
          alert("No more pages.");
          return;
        }

        const name = Names[index];
        const page = Allpages[name];

        if (page.Password) {
          const entered = prompt(`Enter password for "${name}"`);
          if (entered !== page.Password) {
            alert("Wrong password.");
            return;
          }
        }

        pagesArea.innerText = page.Content;

        // ✅ Restore drawing data
        drawingData = page.DrawingData || [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawingData.forEach((stroke) => {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;

          for (let i = 1; i < stroke.points.length; i++) {
            const from = stroke.points[i - 1];
            const to = stroke.points[i];

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
          }
        });

        Currentpage = name;
        pageNames = Names;
        pageIndex = index;
        updatepageNameDisplay();
      }

      // showing the page which is currently being edited in the showpagename div
      pagesArea.addEventListener("input", () => {
        const ShowpageName = document.getElementById("ShowpageName");
        if (Currentpage) {
          ShowpageName.textContent = `${Currentpage}`;
        } else {
          ShowpageName.textContent = "temp page";
        }
      });

      // Export drawing data as png works only on the pages not on the temp page
      document
        .getElementById("CaptureScreenshot")
        .addEventListener("click", () => {
          if (!Currentpage) return alert("No page selected to capture");

          const Allpages = GetAllpages();
          const page = Allpages[Currentpage];
          if (!page) return alert("Selected page does not exist.");

          // Create a temporary canvas to draw the strokes
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;

          // Draw the saved strokes
          page.DrawingData.forEach((stroke) => {
            tempCtx.strokeStyle = stroke.color;
            tempCtx.lineWidth = 2;

            for (let i = 1; i < stroke.points.length; i++) {
              const from = stroke.points[i - 1];
              const to = stroke.points[i];

              tempCtx.beginPath();
              tempCtx.moveTo(from.x, from.y);
              tempCtx.lineTo(to.x, to.y);
              tempCtx.stroke();
            }
          });

          // Convert to PNG and download
          const link = document.createElement("a");
          link.download = `${Currentpage}.png`;
          link.href = tempCanvas.toDataURL("image/png");
          link.click();

          alert("Page exported as PNG successfully!");
        });

      document.getElementById("nextpage").addEventListener("click", () => {
        if (Currentpage) {
          const Allpages = GetAllpages();
          Allpages[Currentpage] = {
            Content: pagesArea.innerText,
            Password: Allpages[Currentpage]?.Password || null,
            DrawingData: drawingData, // ✅ Save the drawing strokes here
          };
          localStorage.setItem(pagesKey, JSON.stringify(Allpages));
        }
        loadpageAt(pageIndex + 1);
      });

      document.getElementById("prevpage").addEventListener("click", () => {
        if (Currentpage) {
          const Allpages = GetAllpages();
          Allpages[Currentpage] = {
            Content: pagesArea.innerText,
            Password: Allpages[Currentpage]?.Password || null,
            DrawingData: drawingData, // ✅ Save the drawing strokes here
          };
          localStorage.setItem(pagesKey, JSON.stringify(Allpages));
        }
        loadpageAt(pageIndex - 1);
      });
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawingData.forEach(stroke => {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.beginPath();

    for (let i = 1; i < stroke.points.length; i++) {
      let p1 = stroke.points[i - 1];
      let p2 = stroke.points[i];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });
}

      function updatepageNameDisplay() {
        const ShowpageName = document.getElementById("ShowpageName");
        if (Currentpage) {
          ShowpageName.textContent = `${Currentpage}`;
        } else {
          ShowpageName.textContent = "temp page";
        }
      }
      const canvas = document.getElementById("pagesCanvas");
      const ctx = canvas.getContext("2d");
      const penButton = document.getElementById("PenTool");
      const colorPicker = document.getElementById("PenColorPicker");
      let penColor = colorPicker.value;
      colorPicker.addEventListener("input", (e) => {
        penColor = e.target.value;
        ctx.strokeStyle = penColor; // Update the pen color
      });
      const eraserautoButton = document.getElementById("shrinkpagesButton");
      let penActive = false;

      function resizeCanvas() {
        canvas.width = pagesPanel.offsetWidth;
        canvas.height = pagesPanel.offsetHeight;
      }
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      penButton.addEventListener("click", () => {
        penActive = !penActive;
        canvas.style.pointerEvents = penActive ? "auto" : "none";
        penButton.textContent = penActive ? "🔤" : "✏️";
      });

      // 🧹 Smart clean only inside boundary
document.getElementById("CleanTool").addEventListener("click", () => {
  const canvas = document.getElementById("pagesCanvas");
  const ctx = canvas.getContext("2d");

  // 🟨 Ask the user for boundary color
  let boundaryColor = prompt("Just Create a boundary around what you want to delete and Enter the boundary color you used (e.g., #000000):");
  if (!boundaryColor) return; // if user cancelled

  // 🟥 Find all points from strokes with the boundary color
  let boundaryStrokes = drawingData.filter(stroke => stroke.color.toLowerCase() === boundaryColor.toLowerCase());

  if (boundaryStrokes.length === 0) {
    alert("No boundary found with that color.");
    return;
  }

  let allBoundaryPoints = boundaryStrokes.flatMap(stroke => stroke.points);
  let allX = allBoundaryPoints.map(p => p.x);
  let allY = allBoundaryPoints.map(p => p.y);

  // 🟩 Get bounding box (minX, maxX, minY, maxY)
  let minX = Math.min(...allX);
  let maxX = Math.max(...allX);
  let minY = Math.min(...allY);
  let maxY = Math.max(...allY);

  // 🟦 Now filter out all strokes that are fully inside this box
  drawingData = drawingData.filter(stroke => {
    // Check if all points in this stroke are inside the boundary
    let isInside = stroke.points.every(p =>
      p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
    );
    return !isInside; // keep strokes outside the boundary
  });

  // 🧽 Clear everything
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🖌️ Re-draw remaining strokes
  drawingData.forEach(stroke => {
    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    let points = stroke.points;
    for (let i = 1; i < points.length; i++) {
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  });

  alert("All drawings inside the boundary were removed.");
});


      shrinkpagesButton.addEventListener("click", () => {
        // better to not clear the canvas just hide it
        // ctx.clearRect(0, 0, canvas.width, canvas.height); is not needed as it is clearing the canvas when the pages panel is shrunk best to use hide canvas command
        canvas.style.right = "-98.4vw"; // Hide the canvas when pages panel is shrunk
        penActive = false;
        canvas.style.pointerEvents = "none"; // Disable drawing when the panel is shrunk
        penButton.textContent = penActive ? "🔤" : "✏️";
      });

      expandpagesButton.addEventListener("click", () => {
        setTimeout(() => {
          canvas.style.right = "0"; // Show the canvas when pages panel is expanded
        }, 280); // Delay to ensure the panel is fully expanded before enabling drawing
      });

      canvas.addEventListener("mousedown", (e) => {
        if (!penActive) return;
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      });
      canvas.addEventListener("mousemove", (e) => {
        if (drawing && penActive) {
          ctx.lineTo(e.offsetX, e.offsetY);
          ctx.strokeStyle = penColor;
          ctx.lineWidth = stroke.size;
          ctx.stroke();
        }
      });
      canvas.addEventListener("mouseup", () => {
        drawing = false;
      });
      canvas.addEventListener("mouseleave", () => {
        drawing = false;
      });

      function showYouTubeAnimation() {
        const anim = document.getElementById("youtubeanimation");
        anim.classList.add("animate");

        setTimeout(() => {
          anim.classList.remove("animate");
        }, 1000); // matches animation duration
      }

      function showWhiteOverlayWithAnimation(duration = 1000) {
        const overlay = document.getElementById("whiteOverlay");
        overlay.style.display = "block";
        overlay.style.opacity = "1";

        showYouTubeAnimation();

        setTimeout(() => {
          overlay.style.opacity = "0";
          setTimeout(() => {
            overlay.style.display = "none";
          }, 500);
        }, duration);
      }

      document
        .getElementById("showVideoBtn")
        .addEventListener("click", function () {
          const videoFrame = document.getElementById("YoutubeVideo");
          const pagesArea = document.getElementById("pagesArea");

          if (videoFrame.style.display === "block") {
            // Video is showing, hide video and show notes
            videoFrame.style.display = "none";
            videoFrame.src = ""; // stop the video
            pagesArea.style.display = "block";
          } else {
            // Notes are showing, ask for link and show video
            const link = prompt(
              "Enter the YouTube embed link (starts with https://www.youtube.com/embed/...)"
            );

            if (link) {
              showWhiteOverlayWithAnimation(1000);
              videoFrame.src = link;
              videoFrame.style.display = "block";
              pagesArea.style.display = "none";
            }
          }
        });

      const commandVariables = {}; // stores all variables like n = 5

      function interpret(command) {
        // Add basic sanitization
        command = command.replace(/\s+/g, "");
	if (command.startsWith("print(")) return handlePrint(command);
        if (command.startsWith("loop(")) return handleLoop(command);
        if (command.startsWith("protect(")) return handleProtect(command);
        if (command.startsWith("clear(")) return handleClear(command);
        if (command.startsWith("delete(")) return handleDelete(command);
        if (command.startsWith("create(")) return handleCreate(command);
        if (command.startsWith("open(")) return handleOpen(command);
        if (command.startsWith("import(")) return handleImport(command);
        if (command.startsWith("export(")) return handleExport(command);
        if (command.startsWith("copy-paste(")) return handleCopyPaste(command);
        if (command.startsWith("compare(")) return handleCompare(command);
        if (command.startsWith("search(")) return handleSearch(command);
        if (command.startsWith("fill(")) return handleFill(command);
	if (command.startsWith("auto-correct(")) return handleAutoCorrect(command);
	if (command.startsWith("pen(")) return handlePen(command);
        if (command.startsWith("undo")) {
  let n = parseInt(command.replace("undo(", "").replace(")", ""));
  return undo(isNaN(n) ? 1 : n);
}

if (command.startsWith("redo")) {
  let n = parseInt(command.replace("redo(", "").replace(")", ""));
  return redo(isNaN(n) ? 1 : n);
}


        return [0];
      }

      cmd = replaceVariables(cmd);

      function runCommand() {
        const input = document.getElementById("commandInput").value.trim();
        if (!input) return;

        if (input.startsWith("fill(") && input.endsWith(")")) {
            const condition = input.slice(5, -1); // extract content inside fill(...)
            handleFill(condition);
        }

        // ✅ 1. Variable Assignment Handling (e.g., n = 10)
        else if (input.includes("=") && !input.includes("[")) {
          const [varName, expression] = input.split("=").map((s) => s.trim());
          if (!varName || !expression) {
            document.getElementById("commandOutput").style.color = "#000000";
            document.getElementById("commandOutput").textContent =
              "❌ Error: Invalid variable assignment.";
            return;
          }
          try {
            const value = evaluateExpression(expression);
            commandVariables[varName] = value;
            document.getElementById("commandOutput").style.color = "#000000";
            document.getElementById(
              "commandOutput"
            ).textContent = `✅ Variable ${varName} set to ${value}`;
          } catch (err) {
            document.getElementById("commandOutput").style.color = "#000000";
            document.getElementById(
              "commandOutput"
            ).textContent = `❌ Error: ${err.message}`;
          }
          return;
        }
        // ✅ Array Assignment Handling
        else if (input.includes("=") && input.includes("[")) {
  			const [varName, expression] = input.split("=").map((s) => s.trim());
  			if (!varName || !expression) {
    				document.getElementById("commandOutput").style.color = "#000000";
    				document.getElementById("commandOutput").textContent =
     			    "❌ Error: Invalid array assignment.";
    				return;
 			 }
  			try {
    				// Convert string "[1,2,3]" to actual array [1,2,3]
    				const value = JSON.parse(expression.replace(/'/g, '"'));
    				if (!Array.isArray(value)) throw new Error("Invalid array syntax");

    				// Save variable
    				commandVariables[varName] = value;

    				document.getElementById("commandOutput").style.color = "#000000";
    				document.getElementById("commandOutput").textContent = `✅ Array ${varName} set to ${JSON.stringify(value)}`;
  			}
	  catch (err) {
    				document.getElementById("commandOutput").style.color = "#000000";
    				document.getElementById("commandOutput").textContent = `❌ Error: ${err.message}`;
  			}
  			return;
	}

        // ✅ 2. print(variable) Command (e.g., print(n))
        else if (input.startsWith("print(") && input.endsWith(")")) {
  const expression = input.slice(6, -1).trim();

  try {
    // Special case: print all commandVariables
    if (expression === "commandVariables") {
      document.getElementById("commandOutput").style.color = "#000000";
      document.getElementById("commandOutput").textContent = JSON.stringify(commandVariables, null, 2);
      return;
    }

    // Replace variable names with actual values, including arrays
    const evaluatedExpression = expression.replace(
      /\b[a-zA-Z_]\w*(\[[^\]]+\])?\b/g, // matches varName or varName[index]
      (match) => {
        // Check if it's array access
        const arrayMatch = match.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
        if (arrayMatch) {
          const varName = arrayMatch[1];
          const indexExpr = arrayMatch[2];
          if (commandVariables.hasOwnProperty(varName)) {
            const arrayVal = commandVariables[varName];
            if (!Array.isArray(arrayVal)) return "[0]";
            const index = parseInt(eval(indexExpr)); // allow numeric expressions like 0+1
            return arrayVal[index] !== undefined ? arrayVal[index] : "[0]";
          } else {
            return "[0]";
          }
        }

        // Simple variable
        if (commandVariables.hasOwnProperty(match)) {
          const val = commandVariables[match];
          // Convert arrays/objects to string for eval
          return Array.isArray(val) ? JSON.stringify(val) : val;
        } else {
          return "[0]";
        }
      }
    );

    const result = eval(evaluatedExpression); // Evaluate the final expression
    document.getElementById("commandOutput").style.color = "#000000";
    document.getElementById("commandOutput").textContent = `${result}`;
  } catch (err) {
    document.getElementById("commandOutput").style.color = "#000000";
    document.getElementById("commandOutput").textContent = `❌ Error: ${err.message}`;
  }

  return;
}


        // ✅ 3. Variable + Math Replacement using {}
        const replacedInput = replaceVariables(input);

        // ✅ 4. Core Execution
        try {
          const result = interpret(replacedInput); // core engine like create(), loop(), etc.
          document.getElementById("commandOutput").style.color = "#000000";
          const sum = result.reduce((a, b) => a + b, 0);
          commandVariables["sum"] = sum;
	  commandVariables["output"] = result;
          document.getElementById(
            "commandOutput"
          ).textContent = `🔢 Sum: ${sum} ✅ Output: ${JSON.stringify(
            result
          )} `;
        } catch (err) {
          document.getElementById("commandOutput").style.color = "#000000";
          document.getElementById(
            "commandOutput"
          ).textContent = `❌ Error: ${err.message}`;
        }
      }

      function evaluateExpression(expression) {
        try {
          // Replace known variables with their values
          const withVars = expression.replace(/\b[a-zA-Z_]\w*\b/g, (match) => {
            if (commandVariables.hasOwnProperty(match)) {
              return JSON.stringify(commandVariables[match]); // handles arrays too
            }
            return match; // unknown variables are kept as-is
          });

          return Function(`"use strict"; return (${withVars})`)();
        } catch (err) {
          return 0;
        }
      }

      function replaceVariables(cmd) {
if (cmd.startsWith("fill(")) return cmd; // leave fill() as-is
        return cmd.replace(/{([^}]+)}/g, (match, expression) => {
          try {
            // Replace variable names with their values
            const replacedExpr = expression.replace(/\b\w+\b/g, (name) => {
              return commandVariables.hasOwnProperty(name)
                ? commandVariables[name]
                : name;
            });
            return evaluateExpression(replacedExpr);
          } catch {
            return match; // fallback if evaluation fails
          }
        });
      }


      function handleExport(cmd) {
  const match = cmd.match(/^export\(([^)]+)\)$/);
  if (!match) {
    return [0];
  }

  const page1 = match[1].trim().replace(/\n$/, "");
  const Allpages = GetAllpages();
  const page = Allpages[page1];

  function betterEncode(str, key = 1, multiplier = 2) {
  const raw = [...str].map(char => {
    const code = char.charCodeAt(0);

    if (/[A-Z]/.test(char)) {
      const pos = code - 64;
      return 'U' + ((pos + key) * multiplier);
    } else if (/[a-z]/.test(char)) {
      const pos = code - 96;
      return 'L' + ((pos + key) * multiplier);
    } else if (/[0-9]/.test(char)) {
      return 'D' + ((parseInt(char) + key) * multiplier);
    } else {
      return 'C' + ((code + key) * multiplier);
    }
  });

  // compress repeats
  let result = '';
  let prev = null;
  let count = 0;

  for (const token of raw) {
    if (token === prev) {
      count++;
    } else {
      if (prev !== null) {
        result += count > 1 ? `${prev}*${count}` : prev;
      }
      prev = token;
      count = 1;
    }
  }

  if (prev !== null) {
    result += count > 1 ? `${prev}*${count}` : prev;
  }

  return result;
}




  const jsonData = {
    content: betterEncode(page.Content || ""),
    drawingData: (page.DrawingData || []).map(item => betterEncode(JSON.stringify(item))),
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `MyBook/NoteBook/${page1}.json`;
  link.click();

  return [1];
}


      function handleImport(cmd) {
  const match = cmd.match(/^import\(([^)]+)\)$/);
  if (!match) {
    return [0];
  }

  const targetPageName = match[1].trim();

  function betterDecode(encodedStr, key = 1, multiplier = 2) {
  const tokens = [];
    let i = 0;

    while (i < encodedStr.length) {
        const type = encodedStr[i]; // U, L, D, C
        i++;
        let numStr = '';
        while (i < encodedStr.length && /[0-9]/.test(encodedStr[i])) {
            numStr += encodedStr[i];
            i++;
        }
        const num = parseInt(numStr);

        if (type === 'U') {
            tokens.push(String.fromCharCode(((num / multiplier) - key) + 64));
        } else if (type === 'L') {
            tokens.push(String.fromCharCode(((num / multiplier) - key) + 96));
        } else if (type === 'D') {
            tokens.push(((num / multiplier) - key).toString());
        } else if (type === 'C') {
            tokens.push(String.fromCharCode((num / multiplier) - key));
        }
    }

    return tokens.join('');
}




  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const rawData = JSON.parse(e.target.result);

          const allPages = JSON.parse(localStorage.getItem("Savedpages")) || {};
          allPages[targetPageName] = {
            Content: betterDecode(rawData.content || ""),
            DrawingData: (rawData.drawingData || []).map(item => JSON.parse(betterDecode(item))),
          };

          localStorage.setItem("Savedpages", JSON.stringify(allPages));
        } catch (error) {
          return [0];
        }
      };
      reader.readAsText(file);
    } else {
      return [0];
    }
  });

  document.body.appendChild(fileInput);
  fileInput.click();

  return [1];
}


      function handleCreate(cmd) {
        const page = cmd.match(/create\((.*?)\)/)[1];
        const Allpages = GetAllpages();
        if (Allpages[page]) return [0];
        Allpages[page] = { Content: "", DrawingData: [], Password: null };
        localStorage.setItem("Savedpages", JSON.stringify(Allpages));
        return [1];
      }
function handlePrint(cmd) {
  const expression = cmd.slice(6, -1).trim(); // now uses cmd, not input

  try {
    const evaluatedExpression = expression.replace(
      /\b[a-zA-Z_]\w*(\[[^\]]+\])?\b/g,
      (match) => {
        const arrayMatch = match.match(/^([a-zA-Z_]\w*)\[(.+)\]$/);
        if (arrayMatch) {
          const varName = arrayMatch[1];
          const indexExpr = arrayMatch[2];
          if (commandVariables.hasOwnProperty(varName)) {
            const arrayVal = commandVariables[varName];
            if (!Array.isArray(arrayVal)) return "[0]";
            const index = parseInt(eval(indexExpr));
            return arrayVal[index] !== undefined ? arrayVal[index] : "[0]";
          } else {
            return "[0]";
          }
        }
        if (commandVariables.hasOwnProperty(match)) {
          const val = commandVariables[match];
          return Array.isArray(val) ? JSON.stringify(val) : val;
        } else {
          return "[0]";
        }
      }
    );

    const result = eval(evaluatedExpression);
    document.getElementById("commandOutput").style.color = "#000000";
    document.getElementById("commandOutput").textContent = `${result}`;
    return [result]; // important! return result for loop to collect
  } catch (err) {
    document.getElementById("commandOutput").style.color = "#000000";
    document.getElementById("commandOutput").textContent = `❌ Error: ${err.message}`;
    return [0];
  }
}

      function handleLoop(cmd) {
  try {
    const match = cmd.match(/^loop\((.*);(.*)\)$/);
    if (!match) return [0];

    const arrExpr = match[1].trim();
    const commandTemplate = match[2].trim();
    console.log("arrExpr:", arrExpr);
    console.log("commandTemplate:", commandTemplate);

    const arr = parseArrayExpression(arrExpr);
    if (!Array.isArray(arr)) {
      console.error("❌ Invalid array in loop");
      return [0];
    }

    const results = [];
    for (const value of arr) {
      const command = commandTemplate.replace(/{}/g, value);
      const output = interpret ? interpret(command) : [command];
      results.push(...output);
    }
    return results;

  } catch (err) {
    console.error("❌ Loop Error:", err.message);
    return [0];
  }
}

// ----------------------
// Main parser for arrays, ranges, variables, and chaining
// ----------------------
function parseArrayExpression(expr) {
  expr = expr.trim();

  // Split base and chained methods
  const [basePart, ...chainParts] = expr.split(".").filter(Boolean);
  let arr = buildBaseArray(basePart);

  // Process each chain in order
  for (const part of chainParts) {
    arr = applyArrayMethod(arr, part);
  }

  return arr;
}

// ----------------------
// Create the base array (variable, literal, or range)
// ----------------------
function buildBaseArray(baseExpr) {
  baseExpr = baseExpr.trim();

  if (baseExpr.startsWith("range(")) return buildRange(baseExpr);
  if (baseExpr.startsWith("[")) return JSON.parse(baseExpr.replace(/'/g, '"'));

  // If it's a variable
  if (commandVariables && commandVariables.hasOwnProperty(baseExpr)) {
    return [...commandVariables[baseExpr]];
  }

  return [];
}

// ----------------------
// Apply one chain method like remove(...), add(...), unique()
// ----------------------
function applyArrayMethod(baseArray, methodExpr) {
  const match = methodExpr.match(/^(\w+)\((.*)\)$/);
  if (!match) return baseArray;

  const method = match[1];
  const argStr = match[2].trim();

  let argArray = [];
  if (argStr) argArray = parseArrayExpression(argStr);

  switch (method) {
    case "remove":
      return baseArray.filter(x => !argArray.includes(x));
    case "add":
      return [...baseArray, ...argArray];
    case "unique":
      return [...new Set(baseArray)];
    case "reverse":
      return [...baseArray].reverse();
case "filter":
      // Evaluate the condition for each element
      return baseArray.filter(x => {
        try {
          // Replace {} in the argument string with the current element
          const expr = argStr.replace(/{}/g, x);
          return eval(expr); // returns true/false
        } catch (e) {
          console.error("❌ filter error:", e);
          return false;
        }
      });

    default:
      console.warn("⚠️ Unknown method:", method);
      return baseArray;
  }
}

// ----------------------
// Build range(start,end,step)
// ----------------------
function buildRange(expr) {
  const match = expr.match(/^range\(([^)]+)\)$/);
  if (!match) return [];
  const parts = match[1].split(",").map(x => Number(x.trim()));
  const [start, end, step = 1] = parts;
  const result = [];
  for (let i = start; i < end; i += step) result.push(i);
  return result;
}



      function handleProtect(cmd) {
        const args = cmd.match(/protect\((.*?)\)/)[1].split(",");
        if (args.length < 2) return [0]; // missing password

        const [page, passwordRaw] = args.map((s) => s.trim());
        const Allpages = GetAllpages();

        if (!Allpages[page]) return [0];
        if (!passwordRaw && passwordRaw !== "0") return [0]; // empty or missing password

        Allpages[page].Password = passwordRaw === "0" ? null : passwordRaw;
        localStorage.setItem("Savedpages", JSON.stringify(Allpages));
        return [1];
      }

      function handleClear(cmd) {
        const page = cmd.match(/clear\((.*?)\)/)[1].trim();
        const Allpages = GetAllpages();
        if (!Allpages[page]) return [0];
        Allpages[page].Content = "";
        Allpages[page].DrawingData = []; // Clear drawing data
        localStorage.setItem("Savedpages", JSON.stringify(Allpages));
        return [1];
      }

      function handleDelete(cmd) {
        const page = cmd.match(/delete\((.*?)\)/)[1].trim();
        const Allpages = GetAllpages();
    if (page.startsWith("commandVariables[") && page.endsWith("]")) {
    const key = page.slice(17, -1).trim().replace(/['"]/g, ""); // Remove quotes

    if (commandVariables.hasOwnProperty(key)) {
      delete commandVariables[key];
      document.getElementById("commandOutput").style.color = "#000000";
      document.getElementById("commandOutput").textContent = `✅ Deleted variable "${key}" from commandVariables`;
      return [1];
    } else {
      document.getElementById("commandOutput").style.color = "#000000";
      document.getElementById("commandOutput").textContent = `⚠️ Variable "${key}" not found in commandVariables`;
      return [0];
    }
  }

        if (!Allpages[page]) return [0];
        delete Allpages[page];
        localStorage.setItem("Savedpages", JSON.stringify(Allpages));
        document.getElementById("prevpage").style.display = "none";
        document.getElementById("nextpage").style.display = "none";
        return [1];
      }

      function handleOpen(cmd) {
        const page = cmd.match(/open\((.*?)\)/)[1].trim();
        const Allpages = GetAllpages();
        if (!Allpages[page]) return [0];
        pagesArea.innerText = Allpages[page].Content;
        drawingData = Allpages[page].DrawingData || []; // Load drawing data
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
        drawingData.forEach((stroke) => {
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.size;

          for (let i = 1; i < stroke.points.length; i++) {
            const from = stroke.points[i - 1];
            const to = stroke.points[i];

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
          }
        });
        Currentpage = page;
        updatepageNameDisplay();
        document.getElementById("prevpage").style.display = "inline";
        document.getElementById("nextpage").style.display = "inline";
        return [1];
      }

      function handleCopyPaste(cmd) {
        const args = cmd.match(/copy-paste\((.*?)\)/)[1].split(",");
        if (args.length < 2) return [0];

        const [sourcePage, targetPage] = args.map((s) => s.trim());

        if (
          !sourcePage ||
          !targetPage ||
          sourcePage === "0" ||
          targetPage === "0"
        ) {
          return [0];
        }

        if (sourcePage === targetPage) {
          return [0];
        }

        const Allpages = GetAllpages();

        if (!Allpages[sourcePage]) {
          return [0];
        }

        if (!Allpages[targetPage]) {
          return [0];
        }

        Allpages[targetPage].Content = Allpages[sourcePage].Content || "";
        Allpages[targetPage].DrawingData = [
          ...(Allpages[sourcePage].DrawingData || []),
        ];

        localStorage.setItem("Savedpages", JSON.stringify(Allpages));
        return [1];
      }

      function handleCompare(cmd) {
  const args = cmd.match(/compare\((.*?)\)/);
  if (!args) return [0];

  const [page1, page2] = args[1].split(",").map(s => s.trim());

  if (!page1 || !page2 || page1 === "0" || page2 === "0" || page1 === page2) {
    return [0];
  }

  const Allpages = GetAllpages();

  if (!Allpages[page1] || !Allpages[page2]) {
    return [0];
  }

  const contentMatch = (Allpages[page1].Content || "") === (Allpages[page2].Content || "");
  const drawingMatch = JSON.stringify(Allpages[page1].DrawingData || []) === JSON.stringify(Allpages[page2].DrawingData || []);

  return contentMatch && drawingMatch ? [1] : [0];
}

function handleSearch(cmd) {
  const args = cmd.match(/search\((.*?)\)/);
  if (!args) return [0];

  const [pageName, word] = args[1].split(',').map(s => s.trim());
  if (!pageName || !word) return [0];

  const Allpages = GetAllpages();
  if (!Allpages[pageName]) return [0];

  const content = Allpages[pageName].Content || "";
  return content.includes(word) ? [1] : [0];
}



      function toggleCommandInput() {
        const container = document.getElementById("commandContainer");
        const pagefooter = document.getElementById("pagesFooter");
        const output = document.getElementById("commandOutput");
        const copyright = document.getElementById("copyright");
        if (container.style.display === "none") {
          container.style.display = "block";
          pagefooter.style.background =
            "linear-gradient(135deg, #7b00ff, #3780ff, #00ffe0, #7b00ff, #3780ff, #00ffe0)";
          output.style.display = "block";
	  copyright.style.display = "none";
        } else {
          container.style.display = "none";
          pagefooter.style.background = "#0f1111";
          output.style.display = "none";
	  copyright.style.display = "block";
        }
      }

      function helpfunction() {
        const argInput = document.getElementById("argInput");
        const commandsListDiv = document.getElementById("commandsList");

        const isVisible = argInput.style.display === "block";

        if (isVisible) {
          // 🔽 Hide panel
          argInput.style.display = "none";
          commandsListDiv.innerHTML = "";
        } else {
          // 🔼 Show panel and populate
          argInput.style.display = "block";

          const commands = [
            "copy-paste({arg}, targetPage)",
            "copy-paste(page{arg}, targetPage)",
            "compare({arg}, targetPage)",
            "compare(page{arg}, targetPage)",
            "loop([1,2,3,4].remove(range(1,3)).unique();create(page{}))",
   	   "loop(range(1,10).remove([5]);compare(page5,page{}))",
           "loop([1,2,3,4].add(range(5,11)).unique();print({}+{}))",
            "protect(page{arg}, password)",
            "search(page{arg}, searchWord)",
            "clear({arg})",
            "clear(page{arg})",
            "clear(page{{arg}+{arg}})",
            "delete({arg})",
	    "delete(commandVariables[{arg}])",
            "open({arg})",
            "create({arg})",
            "print({arg})",
            "import({arg})",
            "export({arg})",
	    "print(commandVariables)",
            "fill(x=755)",
            "fill(y=325)",
	    "fill(x-755=y-325)",
	    "fill(Math.sqrt((x - 755) ** 2 + (y - 325) ** 2) < 50 + 40 * Math.sin(6 * Math.atan2(y - 325, x - 755)))",
	    "fill((x-755)**2+(y-325)**2<100)",
            "fill({arg})",
	    "auto-correct(#000000)",
	    "{arg} = 10",
            "{arg} = {arg} + {arg}",
	   "{arg} = [1,2,3,4]",
	   "pen(5)",
	   "undo({arg})",
           "redo(steps)"
          ];

          commandsListDiv.innerHTML = ""; // Clear previous list

          commands.forEach((cmdTemplate) => {
            const button = document.createElement("button");
            button.textContent = cmdTemplate;
            button.style.margin = "1vh";
            button.style.padding = "0.5vh 0.5vw";
            button.style.cursor = "pointer";

            button.onclick = () => {
              const arg = argInput.value.trim() || "page1";
              const command = cmdTemplate.replaceAll("{arg}", arg);
              document.getElementById("commandInput").value = command;
            };

            commandsListDiv.appendChild(button);
          });
        }
      }
      function handleFill(condition) {
  const canvas = document.getElementById("pagesCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const color = document.getElementById("PenColorPicker").value || "#000";

  const size = 1; // prevent crash

  ctx.fillStyle = color;

  try {
    condition = condition.replace(/([^<>!=])=([^=])/g, '$1===$2');
    const safeEval = new Function("x", "y", "Math", `return (${condition});`);

    const currentStroke = { color, size, points: [] };

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let result = false;
        try {
          result = safeEval(x, y, Math);
        } catch {
          continue;
        }

        if (result) {
          ctx.fillRect(x, y, 1, 1);
          currentStroke.points.push({ x, y });
        }
      }
    }

    drawingData.push(currentStroke);
    return [1];
  } catch {
    return [0];
  }
}
function handleAutoCorrect(command) {
  // Extract color like auto-correct(#000000);
  const match = command.match(/auto-correct\((#[0-9A-Fa-f]{6})\)/);
  if (!match) return [0];
  const targetColor = match[1];

  const canvas = document.getElementById("pagesCanvas");
  const ctx = canvas.getContext("2d");
  if (!drawingData || drawingData.length === 0) {
    console.warn("No drawings found to correct!");
    return [0];
  }

  let corrected = false; // ✅ Track if any shape is corrected

  // Don’t clear yet — only if something changes!

  drawingData.forEach(stroke => {
    if (stroke.color !== targetColor) return;

    const pts = stroke.points;
    if (pts.length < 5) return;

    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY;

    // === Improved Line Detection (works for slanted lines) ===
    const n = pts.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    const m = den === 0 ? Infinity : num / den;
    const b = meanY - m * meanX;
    let totalDist = 0;
    for (let i = 0; i < n; i++) {
      if (m === Infinity) totalDist += Math.abs(xs[i] - meanX);
      else totalDist += Math.abs(m * xs[i] - ys[i] + b) / Math.sqrt(m * m + 1);
    }
    const avgDist = totalDist / n;
    const isLine = avgDist < 5;

    // === Shape detection ===
    const isCircle = Math.abs(w - h) < 15 && pts.length > 15;
    const isRect = Math.abs(w - h) > 15 && pts.length > 8 && !isLine;
    const isTriangle =
      !isCircle &&
      !isRect &&
      !isLine &&
      Math.abs(perimeter(pts) - (w + h + Math.sqrt(w*w + h*h))) < 25;

    // === Draw shapes ===
    if (isCircle || isRect || isTriangle || isLine) {
      if (!corrected) {
        // ✅ Clear only once, when we’re sure something will be redrawn
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;

      if (isCircle) {
        ctx.arc((minX + maxX)/2, (minY + maxY)/2, Math.max(w, h)/2, 0, Math.PI*2);
      } else if (isRect) {
        ctx.rect(minX, minY, w, h);
      } else if (isTriangle) {
        ctx.moveTo(minX + w/2, minY);
        ctx.lineTo(maxX, maxY);
        ctx.lineTo(minX, maxY);
        ctx.closePath();
      } else if (isLine) {
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }

      ctx.stroke();
      corrected = true;
    }
  });

  console.log("✅ AI Auto-Correct complete!");
  return corrected ? [1] : [0]; // ✅ [1] if corrected, [0] if not
}

function perimeter(pts) {
  let suma = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x;
    const dy = pts[i].y - pts[i-1].y;
    suma += Math.sqrt(dx*dx + dy*dy);
  }
  return suma;
}

function handlePen(cmd) {
  const canvas = document.getElementById("pagesCanvas");
  const ctx = canvas.getContext("2d");
  const size = parseInt(cmd.match(/\d+/)[0], 10);
  pensize = size;
  return [1];
}
function undo(steps = 1) {
  let results = [];
  for (let i = 0; i < steps; i++) {
    if (drawingData.length > 0) {
      redoStack.push(drawingData.pop());
      results.push(1);
    } else {
      results.push(0);
    }
  }
  redrawCanvas();
  return results;
}

function redo(steps = 1) {
  let results = [];
  for (let i = 0; i < steps; i++) {
    if (redoStack.length > 0) {
      drawingData.push(redoStack.pop());
      results.push(1);
    } else {
      results.push(0);
    }
  }
  redrawCanvas();
  return results;
}