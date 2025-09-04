import firebase_admin
from firebase_admin import credentials, firestore
from RPA.Desktop import Desktop

# --- Firebase Configuration ---
# Replace with your Firebase project's service account key file
SERVICE_ACCOUNT_KEY_PATH = "path/to/your/serviceAccountKey.json" 
DATABASE_URL = "https://your-project-id.firebaseio.com"

# --- Application Configuration ---
APP_EXECUTABLE = "Retaguarda.exe"
APP_WINDOW_TITLE = "Retaguarda" # Adjust if the window title is different

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        'databaseURL': DATABASE_URL
    })
    return firestore.client()

def get_batteries_from_firestore(db):
    """Fetches all batteries from the Firestore database."""
    batteries_ref = db.collection('batteries')
    return batteries_ref.stream()

def update_battery_quantity_in_firestore(db, battery_id, new_quantity):
    """Updates the quantity of a specific battery in Firestore."""
    battery_ref = db.collection('batteries').document(battery_id)
    battery_ref.update({'quantity': new_quantity})

def main():
    """Main function to sync battery quantities."""
    desktop = Desktop()
    db = initialize_firebase()
    batteries = get_batteries_from_firestore(db)

    try:
        # Open the Retaguarda application
        desktop.open_application(APP_EXECUTABLE)
        desktop.wait_for_window(title=APP_WINDOW_TITLE)

        # Navigate to the "Consulta resumida" sub-menu
        desktop.click("image:consulta_resumida_menu.png")

        for battery in batteries:
            battery_data = battery.to_dict()
            barcode = battery_data.get('barcode')

            if barcode:
                # --- UI Automation Steps ---
                # 1. Find the barcode input field and type the barcode
                desktop.input_text("image:barcode_input.png", barcode, enter=True)
                
                # 2. Read the quantity from the screen
                #    Find the location of the store 1 label
                store_1_location = desktop.find_element("image:store_1_label.png").region
                #    The quantity should be to the right of the label. 
                #    We'll define a region to the right of the label and get the text from there.
                quantity_region = store_1_location.right(100) # Adjust the width of the region as needed
                quantity_text = desktop.get_text(region=quantity_region)
                new_quantity = int(quantity_text)

                # 3. Update the quantity in Firestore
                update_battery_quantity_in_firestore(db, battery.id, new_quantity)
                
                print(f"Synced quantity for barcode: {barcode}")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        # Close the application
        desktop.close_all_applications()

if __name__ == "__main__":
    main()