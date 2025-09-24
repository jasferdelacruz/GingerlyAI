# Contributing to GingerlyAI

We love your input! We want to make contributing to GingerlyAI as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/GingerlyAI.git
   cd GingerlyAI
   ```

2. **Set Up Development Environment**
   ```bash
   # Backend setup
   cd backend
   npm install
   cp env.example .env
   # Configure your database settings in .env
   
   # Frontend setup
   cd ../mobile
   npm install
   ```

3. **Set Up ML Training (Optional)**
   ```bash
   cd ../ml-training
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

## 🌱 Development Workflow

We use [GitHub Flow](https://guides.github.com/introduction/flow/index.html), so all code changes happen through pull requests.

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

3. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd mobile && npm test
   
   # ML pipeline tests
   cd ml-training && python -m pytest
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add disease prediction confidence threshold"
   ```

5. **Push and Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: add offline model caching for mobile app
fix: resolve camera permission issue on Android
docs: update API documentation for model endpoints
style: format code according to ESLint rules
```

## 🐛 Bug Reports

Great bug reports include:

1. **Summary**: Clear, one-line summary
2. **Environment**: OS, browser, device, versions
3. **Steps to Reproduce**: Numbered list of exact steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots/Logs**: If applicable

**Use the bug report template:**
```markdown
## Bug Summary
Brief description of the issue

## Environment
- OS: [e.g., Windows 10, macOS 12, Android 11]
- Browser/App Version: [e.g., Chrome 96, GingerlyAI v1.0]
- Device: [e.g., iPhone 13, Samsung Galaxy S21]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Screenshots/Logs
If applicable, add screenshots or log outputs.
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with implementation details
4. **Consider alternatives** and explain why your approach is best

## 🏗️ Code Style Guidelines

### JavaScript/React
- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep components small and focused

```javascript
/**
 * Predicts disease from image using TensorFlow.js model
 * @param {string} imageUri - URI of the image to analyze
 * @returns {Promise<Object>} Prediction results with confidence scores
 */
async function predictDisease(imageUri) {
  // Implementation
}
```

### Python
- Follow PEP 8 style guide
- Use type hints where applicable
- Add docstrings for functions and classes
- Keep functions focused and small

```python
def preprocess_image(image_path: str, target_size: tuple = (224, 224)) -> np.ndarray:
    """
    Preprocess image for model inference.
    
    Args:
        image_path: Path to the image file
        target_size: Target size for resizing (height, width)
        
    Returns:
        Preprocessed image as numpy array
    """
    # Implementation
```

### Database
- Use descriptive table and column names
- Add proper indexes for performance
- Include migration scripts for schema changes
- Document schema changes in commit messages

## 🧪 Testing Guidelines

### Frontend Testing
- Write unit tests for utilities and services
- Add integration tests for critical user flows
- Test offline functionality
- Verify camera and ML integration

### Backend Testing
- Write unit tests for controllers and services
- Add integration tests for API endpoints
- Test authentication and authorization
- Verify database operations

### ML Testing
- Test data preprocessing pipelines
- Validate model training scripts
- Verify model export functionality
- Test inference accuracy

## 📚 Documentation

### Code Documentation
- Add inline comments for complex logic
- Write clear function and class documentation
- Update README files when adding features
- Include usage examples

### API Documentation
- Document all endpoints with parameters
- Include request/response examples
- Specify authentication requirements
- Note any rate limiting or restrictions

## 🌍 Internationalization

When adding new features:
- Use translation keys instead of hardcoded strings
- Consider right-to-left (RTL) language support
- Test with different locales
- Update translation files

## 🔒 Security Guidelines

- **Never commit sensitive data** (API keys, passwords)
- **Validate all user inputs** on both client and server
- **Use HTTPS** for all API communications
- **Follow OWASP guidelines** for web security
- **Report security issues privately** to maintainers

## 📱 Mobile Development

### iOS Considerations
- Test on different iOS versions (13+)
- Verify camera and storage permissions
- Check offline functionality
- Test memory usage during ML inference

### Android Considerations
- Test on different Android versions (API 21+)
- Verify permissions and security
- Check performance on lower-end devices
- Test offline database synchronization

## 🤖 Machine Learning

### Model Contributions
- Document model architecture changes
- Include performance metrics and comparisons
- Provide training data requirements
- Test model export to TensorFlow.js

### Dataset Guidelines
- Ensure proper licensing for training data
- Document data sources and collection methods
- Maintain data quality standards
- Follow ethical AI practices

## 🎯 Areas We Need Help With

- **Disease Detection Accuracy**: Improving ML model performance
- **Mobile Performance**: Optimizing app speed and battery usage
- **Accessibility**: Making the app usable for everyone
- **Internationalization**: Adding support for more languages
- **Documentation**: Improving guides and tutorials
- **Testing**: Expanding test coverage

## ❓ Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Create a GitHub Issue
- **Security Issues**: Email security@gingerlyai.com
- **Feature Requests**: Create a GitHub Issue with the "enhancement" label

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to GingerlyAI! 🌱🤖**

Together, we're helping farmers detect and treat ginger diseases more effectively.
