<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# Stealimg Machine 🎯


## Basic Details
### Team Name: Unemployed Innovators


### Team Members
- Team Lead: Ejo Abhilash - College of Engineering TVM
- Member 2: Devadathan J - College of Engineering TVM


### Project Description
Basically our project is an unique wending machine which give the product only if you paid the price higher than the actual price. The key point is that the actual price of the project wont be shown in the menu of wending machine. So if a person wants to recieve a product, he must pay a higher price than he expect it costs. If he pays a price lower than that of the product, he lost his money.
In essence, he will loose his money either way.(Intensity will differ)

### The Problem (that doesn't exist)
Why vending machines are so honest and plain? Noone gets scammed by a vending machine(at least not transparently) and what's the thrill in that?

### The Solution (that nobody asked for)
So, we introduce Stealing Machine. This is, in plain sight, your normal vending machine but, there is a catch. There is no price tag. You are free to guess the amount, whatever you think the product costs. Well, there comes an another catch, i have secretly already increased the price of it, so you will most probably, will loose your money in the first try. So here, you are compelled to pay more to get atleast something out of the machine. So by this machine, atleast the people understands they have been scammed, instead of masking behind a genuine face.

## Technical Details
### Technologies/Components Used
For Software:
- HTML, CSS and JavaScript (ES modules)
- Vite 7 for local development and production builds
- QRCode.js for generating UPI payment QR codes
- Browser Local Storage for the transaction history and ESP32 address
- VS Code, npm and Git

For Hardware:
- ESP32 development board with Wi-Fi connectivity
- Two servo motors connected to GPIO 13 and GPIO 27
- Two two-direction dispensing sections, with one servo controlling each section
- Vending-machine frame
- Arduino IDE with the ESP32 board package and the `ESP32Servo` library
- Jumper wires, suitable servo power supply and USB cable for programming

### Implementation
For Software:
1. Install Node.js and npm.
2. Clone the repository and open the project folder.
3. Install the frontend dependencies:

```bash
npm install
```

4. Start the Vite development server:

```bash
npm run dev
```

For a production build, run:

```bash
npm run build
```

The web interface lets the user select one of four products, enter an amount and scan a generated UPI QR code. A product is released only when the entered amount is greater than or equal to the hidden product price. Losing payments are recorded without dispensing an item, while winning payments call the ESP32 controller and save the transaction result in the browser's local storage.

For Hardware:
1. Install the ESP32 board support package in Arduino IDE.
2. Install the ESP32Servo library.
3. Update the Wi-Fi network details in 'vending_machine_esp32/vending_machine_esp32.ino'.
4. Connect the first servo signal wire to GPIO 13 and the second to GPIO 27. Connect the servo power and ground correctly before testing.
5. Upload the sketch to the ESP32 and open the Serial Monitor at 115200 baud.
6. Copy the IP address printed by the ESP32 and enter it using the web interface's ESP32 SETUP control.

The ESP32 exposes these HTTP endpoints:

- 'GET /status' checks whether the vending controller is online.
- 'GET /dispense?servo=1&direction=left' or 'right'  moves the selected servo for 700 ms and returns it to its neutral position.
- 'OPTIONS /dispense' supports the browser's cross-origin request handling.

# Screenshots (Add at least 3)
![Screenshot1](Add screenshot 1 here with proper name)
*Add caption explaining what this shows*

![Screenshot2](Add screenshot 2 here with proper name)
*Add caption explaining what this shows*

![Screenshot3](Add screenshot 3 here with proper name)
*Add caption explaining what this shows*

# Workflow
Select item --> Enter guessed amount --> Pay the amount --> (checks if amount guessed was greater than the original price) 
(no)
--> nothing happens --> you lost your money
(yes)
--> signal send to ESP32 for the servo motor behind the selected item to be activated --> servo motor activates and the item is dropped


# Schematic & Circuit
https://drive.google.com/file/d/18hSJuCMaK0bWd1GX8xNb1D6mfTtj1ZaV/view?usp=sharing

The signal to ESP32 comes from the website.

# Build Photos
We took no picture of our building stage but, we went in with a amul milk's whole sale packet cardboard thingy and got out with this vwnding machine.

### Project Demo
# Working Demo Files
[View the Stealimg Machine working files on Google Drive](https://drive.google.com/drive/folders/1_Oni-21MhYd6baE6dL1jy0Y7G_Yv6edi?usp=sharing)

# Video
https://drive.google.com/file/d/1tudDo5t8uVNdtI-lz5Rw_ZxflSOsvVTs/view?usp=sharing


## Team Contributions
- Ejo Abhilash : 70% software 30% hardware
- Devadathan J : 30% software 70% hardware

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



