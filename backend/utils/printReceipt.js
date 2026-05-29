const escpos = require("escpos");

// USB printer
escpos.USB = require("escpos-usb");

function printReceipt(cart, total, paymentMethod) {
  try {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);

    device.open(function () {
      printer
        .align("ct")
        .text("PatraPatrika Center")
        .text("-----------------------------")
        .align("lt");

      cart.forEach((item) => {
        printer.text(
          `${item.name} x${item.quantity} = Rs ${item.price * item.quantity}`
        );
      });

      printer
        .text("-----------------------------")
        .text(`TOTAL: Rs ${total}`)
        .text(`Payment: ${paymentMethod}`)
        .text("-----------------------------")
        .align("ct")
        .text("Thank You!")
        .cut()
        .close();
    });
  } catch (err) {
    console.log("Printer error:", err.message);
  }
}

module.exports = printReceipt;