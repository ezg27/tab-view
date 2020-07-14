# TabView


A powerful tab manager extension for Google Chrome.

<img width="400" alt="tabview-screenshot" src="https://user-images.githubusercontent.com/40216869/87453896-25364c00-c5fb-11ea-9e19-a436f56f9dab.png">

Provides an overview of all currently open Chrome windows, allowing tabs to be searched, selected, closed and seamlessly moved within/between windows in just a few clicks.

Quickly opened by key command (Mac: `CMD`+`Shift`+`A`, Windows: `CTRL`+`Shift`+`A`), the user can quickly navigate the list with the `UP` and `DOWN` arrow keys, selecting one with `Enter`. Tabs can be moved within and between windows by clicking and dragging, and the search field will 'fuzzy-filter' the list based on user input.

To return to the search field at any time during arrow key navigation, simply hit the `TAB` key.

## Future Features Roadmap

- Closing windows
- Light / Dark mode
- Muting / unmuting of tabs from within the extension popup
- Tab multi-select

## Development

Fork the repo! To get started with TabView locally:

    git clone <your_fork>
    cd tab-view
    yarn
    yarn build

This will create production build `dist` directory in your project root.

To load the extension in your Chrome browser:

1. Open the Extension Management panel by navigating to [chrome://extensions](chrome://extensions).
2. Enable Developer Mode by clicking the toggle switch on the top right of the page.
3. Click the __LOAD UNPACKED__ button and select the `dist` build folder from your project root.
4. The extension should be successfully installed!

If you make changes to the code, be sure to rerun `yarn build` and click the refresh icon on the TabView panel at [chrome://extensions](chrome://extensions).




## Feedback

I would love to hear any constructive feedback, feature suggestions or about any bugs/issues you encounter. I hope you enjoy using TabView!
