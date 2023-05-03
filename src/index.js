import Quill from 'quill';
import Delta from 'quill-delta';
import TableCell from './js/TableCellBlot';
import TableRow from './js/TableRowBlot';
import Table from './js/TableBlot';
import Contain from './js/ContainBlot';
import './css/quill.table.css';
import TableTrick from "./js/TableTrick";

let Container = Quill.import('blots/container');

Container.order = [
    'list', 'contain',   // Must be lower
    'td', 'tr', 'table'  // Must be higher
];

class TableModule {
    constructor(quill, options) {
        this.quill = quill;
        this.resize = undefined;
        this.x = undefined;
        this.w = undefined;
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.addResizeElement = this.addResizeElement.bind(this);
        
        let toolbar = quill.getModule('toolbar');
        toolbar.addHandler('table', function (value) {
            return TableTrick.table_handler(value, quill);
        });
        let clipboard = quill.getModule('clipboard');
        clipboard.addMatcher('TABLE', function (node, delta) {
            return delta;
        });
        clipboard.addMatcher('TR', function (node, delta) {
            return delta;
        });
        clipboard.addMatcher('TD', function (node, delta) {
            let td = node.getAttribute('table_id') + '|' + node.getAttribute('row_id') + '|' + node.getAttribute('cell_id');
            if (node.style && node.style.width) {
                td += '|' + node.style.width;
            }
            return delta.compose(new Delta().retain(delta.length(), {
                td,
            }));
        });

        this.quill.root.addEventListener('mousedown', this.mouseDownHandler);

        this.addResizeElement();
    }

    mouseDownHandler(e) {
        if (!e.target.classList.contains('resize')) {
            return;
        }

        const resize = e.target;
        this.resize = resize;

        e.preventDefault();

        this.x = e.clientX;

        const styles = window.getComputedStyle(this.resize.parentElement);
        this.w = parseInt(styles.width, 10);

        this.quill.root.addEventListener('mousemove', this.mouseMoveHandler);
        this.quill.root.addEventListener('mouseup', this.mouseUpHandler);

        this.resize.classList.add('resizing');
    }

    mouseMoveHandler(e) {
        const dx = e.clientX - this.x;

        this.resize.parentElement.style.width = `${this.w + dx}px`;
    }

    mouseUpHandler() {
        this.quill.root.removeEventListener('mousemove', this.mouseMoveHandler);
        this.quill.root.removeEventListener('mouseup', this.mouseUpHandler);

        this.resize.classList.remove('resizing');
        this.resize = undefined;

        // save table width changes
        let delta = new Delta().insert('\n');
        this.quill.updateContents(delta, 'user');
        delta = new Delta().delete(1);
        this.quill.updateContents(delta, 'user');
    }

    addResizeElement() {
        setTimeout(() => {
            this.quill.root.querySelectorAll('td').forEach(td => {
                if (!td.querySelector('.resize')) {
                    TableTrick.createResizeElement(td);
                }
            });
        });
    }
}

module.exports = {
    Table,
    TableRow,
    TableCell,
    Contain,
    TableModule
};