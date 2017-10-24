import Quill from 'quill';
import TableTrick from './TableTrick';
import TableRow from './TableRowBlot';
import ContainBlot from './ContainBlot';

let Container = Quill.import('blots/container');
let Parchment = Quill.import('parchment');

class Table extends ContainBlot {
    static create(value) {
        let tagName = 'table';
        let node = super.create(tagName);
        node.setAttribute('table_id', value);
        return node;
    }

    optimize(context) {
        super.optimize(context);
        let next = this.next;
        if (next != null && next.prev === this &&
            next.statics.blotName === this.statics.blotName &&
            next.domNode.tagName === this.domNode.tagName &&
            next.domNode.getAttribute('table_id') === this.domNode.getAttribute('table_id')) {
            next.moveChildren(this);
            next.remove();
        }
    }

    insertBefore(childBlot, refBlot) {
        if (this.statics.allowedChildren != null && !this.statics.allowedChildren.some(function (child) {
                return childBlot instanceof child;
            })) {
            let newChild = Parchment.create(this.statics.defaultChild, TableTrick.random_id());
            newChild.appendChild(childBlot);
            childBlot = newChild;
        }
        super.insertBefore(childBlot, refBlot)
    }

    replace(target) {
        if (target.statics.blotName !== this.statics.blotName) {
            let item = Parchment.create(this.statics.defaultChild, TableTrick.random_id());
            target.moveChildren(item, this);
            this.appendChild(item);
        }
        if (target.parent == null) return;
        super.replace(target)
    }

}

Table.blotName = 'table';
Table.tagName = 'table';
Table.scope = Parchment.Scope.BLOCK_BLOT;
Table.defaultChild = 'tr';
Table.allowedChildren = [TableRow];

export default Table;