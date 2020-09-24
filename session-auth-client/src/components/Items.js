import React from 'react'

class Items extends React.Component {
  state = { 
    order_id: 1
  }

  createOrderItem = (itemId) => {
    fetch("/order_items", {
      method: "POST",
      body: JSON.stringify({
        item_id: itemId,
        order_id: this.state.order_id
      })
    })
  }

  render() {
    return (
      <div>
        <Item title="Vanilla" onClick={this.createOrderItem} />
        <Item title="Chocolate" onClick={this.createOrderItem} />
        <Item title="Mango" onClick={this.createOrderItem} />
      </div>
    )
  }
}

export default Items

// binary search
// BFS/DFS
// HashMap
// dynamic programming