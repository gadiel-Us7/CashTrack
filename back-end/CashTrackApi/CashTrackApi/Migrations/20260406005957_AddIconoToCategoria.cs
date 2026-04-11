using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CashTrackApi.Migrations
{
    /// <inheritdoc />
    public partial class AddIconoToCategoria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Icono",
                table: "Categorias",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Categorias",
                keyColumn: "IdCategoria",
                keyValue: 1,
                column: "Icono",
                value: "bi bi-tag");

            migrationBuilder.UpdateData(
                table: "Categorias",
                keyColumn: "IdCategoria",
                keyValue: 2,
                column: "Icono",
                value: "bi bi-tag");

            migrationBuilder.UpdateData(
                table: "Categorias",
                keyColumn: "IdCategoria",
                keyValue: 3,
                column: "Icono",
                value: "bi bi-tag");

            migrationBuilder.UpdateData(
                table: "Categorias",
                keyColumn: "IdCategoria",
                keyValue: 4,
                column: "Icono",
                value: "bi bi-tag");

            migrationBuilder.UpdateData(
                table: "Categorias",
                keyColumn: "IdCategoria",
                keyValue: 5,
                column: "Icono",
                value: "bi bi-tag");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Icono",
                table: "Categorias");
        }
    }
}
