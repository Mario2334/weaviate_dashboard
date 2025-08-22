# Weaviate Dashboard

A modern, responsive web dashboard for exploring and managing your Weaviate vector database. This dashboard provides an intuitive interface to view schemas, browse objects, and manage classes in your Weaviate instance.

## Features

### 🔍 Schema Explorer
- View all classes in your Weaviate schema
- Inspect class properties and configurations
- Export schema as JSON
- Real-time connection status monitoring

### 📊 Object Browser
- Browse objects within any class
- View object properties and data
- Configurable result limits
- Clean, formatted JSON display

### 🗂️ Class Management
- View detailed class information
- Delete individual classes
- Bulk delete all classes
- Confirmation dialogs for safe operations

### 🎨 Modern UI
- Clean, responsive design
- Mobile-friendly interface
- Real-time loading states
- Intuitive navigation

## Prerequisites

- Python 3.7+
- A running Weaviate instance
- Web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. **Clone or navigate to the dashboard directory:**
   ```bash
   cd weaviate-dashboard
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Weaviate connection:**
   Edit `config.py` to match your Weaviate instance:
   ```python
   WEAVIATE_HOST = "your-weaviate-host"
   WEAVIATE_PORT = 8080
   WEAVIATE_PROTOCOL = "http"  # or "https"
   ```

## Usage

1. **Start the dashboard:**
   ```bash
   python app.py
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

3. **The dashboard will automatically:**
   - Check connection to your Weaviate instance
   - Load the current schema
   - Display connection status in the header

## Dashboard Sections

### Schema Explorer
- **View Schema:** Displays all classes with their properties and configurations
- **Refresh Schema:** Updates the display with the latest schema
- **Export Schema:** Downloads the current schema as a JSON file
- **Class Details:** Click "View" on any class to see detailed information

### Browse Nodes
- **Select Class:** Choose from available classes in your schema
- **Set Limit:** Configure how many objects to retrieve (1-100)
- **Search:** Browse objects and view their properties
- **Delete Objects:** Remove individual objects with confirmation

### Manage Classes
- **View Classes:** See all classes with statistics and actions
- **Class Details:** View detailed class information including all properties
- **Delete Class:** Remove individual classes (with confirmation)
- **Delete All:** Remove all classes from the schema (with confirmation)

## API Endpoints

The dashboard provides a REST API that proxies requests to your Weaviate instance:

- `GET /api/health` - Check Weaviate connection status
- `GET /api/schema` - Get the current schema
- `DELETE /api/schema/<class_name>` - Delete a specific class
- `GET /api/objects/<class_name>` - Get objects from a class
- `DELETE /api/objects/<class_name>/<object_id>` - Delete a specific object
- `POST /api/schema/delete-all` - Delete all classes

## Configuration

### Environment Variables
You can also configure the dashboard using environment variables:

```bash
export WEAVIATE_HOST="your-weaviate-host"
export WEAVIATE_PORT="8080"
export WEAVIATE_PROTOCOL="http"
export FLASK_DEBUG="True"
```

### Custom Configuration
Edit `config.py` to customize:
- Connection settings
- API timeouts
- Default limits
- Flask application settings

## Security Considerations

⚠️ **Important Security Notes:**

1. **Development Use:** This dashboard is designed for development and testing environments
2. **No Authentication:** The dashboard doesn't include built-in authentication
3. **Direct Access:** It provides direct access to delete operations
4. **Network Security:** Ensure your Weaviate instance is properly secured
5. **Production Use:** For production environments, consider:
   - Adding authentication
   - Implementing role-based access control
   - Using HTTPS
   - Restricting network access

## Troubleshooting

### Common Issues

**Connection Failed:**
- Verify Weaviate is running on the specified host/port
- Check firewall settings
- Ensure the host and port in `config.py` are correct

**Empty Schema:**
- Confirm your Weaviate instance has classes defined
- Check Weaviate logs for any errors
- Verify API access permissions

**Browser Issues:**
- Clear browser cache and cookies
- Try a different browser
- Check browser console for JavaScript errors

### Debugging

1. **Check Weaviate connectivity:**
   ```bash
   curl http://your-weaviate-host:8080/v1/meta
   ```

2. **Enable Flask debug mode:**
   Set `DEBUG = True` in `config.py`

3. **View application logs:**
   Check the terminal where you started the dashboard

## Development

### Project Structure
```
weaviate-dashboard/
├── app.py                 # Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── script.js     # Frontend JavaScript
└── README.md            # This file
```

### Customization

**Styling:**
Edit `static/css/style.css` to customize the appearance

**Functionality:**
- Modify `static/js/script.js` for frontend behavior
- Update `app.py` for backend API changes

**Configuration:**
Edit `config.py` for application settings

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review Weaviate documentation
3. Check application logs for errors
