package main

import (
	"encoding/json"
	"fmt"

	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"

	"sort"
	"strconv"
)

type Links struct {
	Name string `json: "name"`
	URL  string `json: "url"`
}

type folder struct {
	Name string `json:"name"`
}

func main() {
	data, err := ioutil.ReadFile("links.json")
	if err != nil {
		log.Println(err)
	}
	_, err = os.Stat("results")
	if err != nil {
		if os.IsNotExist(err) {
			err = os.Mkdir("results", 0755)
			if err != nil {
				log.Println(err)
			}
		}
	}

	// Unmarshal the JSON into a Links struct
	var links []Links
	err = json.Unmarshal(data, &links)
	if err != nil {
		log.Println(err)
	}

	client := &http.Client{}

	// Iterate through the list of links and print each one
	for _, link := range links {
		_, err = os.Stat("results/" + link.Name)
		if err != nil {
			if os.IsNotExist(err) {
				err = os.Mkdir("results/"+link.Name, 0755)
				if err != nil {
					log.Println(err)
				}
			}
		}

		_, err = os.Stat("results/" + link.Name + "/new")
		if err != nil {
			if os.IsNotExist(err) {
				log.Println("File doesn't exist")
			}
		} else {
			// The file exists, so rename it
			fmt.Println("Renaming Files")
			err = os.Rename("results/"+link.Name+"/new", "results/"+link.Name+"/old")
			if err != nil {
				log.Println(err)
			}
		}

		// Make the HTTP GET request
		req, err := http.NewRequest("GET", link.URL, nil)
		if err != nil {
			log.Println(err)
		}
		req.Header = http.Header{
			"User-Agent": {"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36"},
			"Accept":     {"text/html,application/xhtml+xml,application/xml"},
		}
		resp, err := client.Do(req)
		if err != nil {
			//Handle Error
		}
		defer resp.Body.Close()

		// Read the response body
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Println(err)
		}

		// Write the response body to a file in the "results" directory
		err = ioutil.WriteFile("results/"+link.Name+"/new", body, 0644)
		if err != nil {
			log.Println(err)
		}

		cmd := exec.Command("beautify", "-o", "results/"+link.Name+"/new", "results/"+link.Name+"/new")
		// Run the command and get its output
		output, err := cmd.CombinedOutput()
		if err != nil {
			log.Println(err)
		}

		// Print the output of the command
		fmt.Printf("%s", output)

		_, err = os.Stat("results/" + link.Name + "/old")
		if err != nil {
			if os.IsNotExist(err) {
				log.Println("File doesn't exist")
			}
		} else {
			// Set up the command and its arguments
			fmt.Println("Running Diff Command")
			cmd := exec.Command("diff", "-u", "results/"+link.Name+"/old", "results/"+link.Name+"/new")
			// Run the command and get its output
			output, err := cmd.CombinedOutput()
			if err != nil {
				log.Println(err)
			}

			// Write the response body to a file in the "results" directory
			err = ioutil.WriteFile("results/"+link.Name+"/diff", output, 0644)
			if err != nil {
				log.Println(err)
			}
		}

	}

	// Set up the file server to serve files from the "results" directory
	fs := http.FileServer(http.Dir("results"))

	// Create a handler function that sets the "Access-Control-Allow-Origin" header
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fs.ServeHTTP(w, r)
	})

	// Set up the HTTP handler to serve the files
	http.Handle("/results/", http.StripPrefix("/results/", handler))

	http.HandleFunc("/folders/", func(w http.ResponseWriter, r *http.Request) {
		// Get the "offset" and "limit" query parameters
		fmt.Println(r.URL.Query())
		offset, err := strconv.Atoi(r.URL.Query().Get("offset"))
		if err != nil {
			offset = 0
		}
		limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
		if err != nil {
			limit = 10
		}

		// Read the "results" directory
		files, err := ioutil.ReadDir("results")
		sort.Slice(files, func(i, j int) bool {
			return files[i].ModTime().Unix() < files[j].ModTime().Unix()
		})
		files = files[offset:limit]
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Create a slice of folders
		var folders []folder
		for _, f := range files {
			if f.IsDir() {
				folders = append(folders, folder{Name: f.Name()})
			}
		}

		// Write the JSON response
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		json.NewEncoder(w).Encode(folders)
	})

	http.HandleFunc("/stats/", func(w http.ResponseWriter, r *http.Request) {
		// Get the "offset" and "limit" query parameters
		fmt.Println(r.URL.Query())
		path := r.URL.Query().Get("path")
		if err != nil {
			return
		}
		

		// Get the file stats
		fileInfo, err := os.Stat("results/" + path + "/diff")
		if err != nil {
			log.Println(err)
		}

		// Write the JSON response
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		// Print the file stats
		json.NewEncoder(w).Encode(fileInfo.ModTime())
		
	})

	// Start the HTTP server
	log.Fatal(http.ListenAndServe(":9000", nil))
}
