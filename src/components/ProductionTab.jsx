/**
 * Production tab: potions, weapons, blueprints.
 * E2E expects section#containter (typo preserved), #potionButt, images, table headers.
 */
import { useSelector } from 'react-redux';
import { useGame } from '../contexts/GameContext.jsx';
import { selectFullState } from '../store/index.js';

export default function ProductionTab() {
  const game = useGame();
  const state = useSelector(selectFullState);

  const buildings = state.buildings || [];
  const potion = state.potion || {};
  const potions = (state.potions || []).filter((p) => p.enabled === true);
  const weapons = (state.weapons || []).filter((w) => w.enabled === true);
  const blueprints = (state.blueprints || []).filter((b) => b.enabled === true);
  const stockpileName = buildings[1]?.name ?? 'Stockpile';
  const blacksmithName = buildings[3]?.name ?? 'Blacksmith';
  const marketName = buildings[2]?.name ?? 'Market';

  const potionInProgress = potion.working > 0 || (potion.progress && /^\d+:\d+:\d+$/.test(String(potion.progress)));
  const potionDisabled = potionInProgress || (potion.count + (potion.working || 0) >= (potion.maxCount || 0));

  return (
    <section id="containter" data-testid="production-tab">
      <div className="col-lg-6">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><u><b>{stockpileName}</b></u></td>
            </tr>
            <tr>
              <td><u>Item Name</u></td>
              <td><u>Description</u></td>
              <td><u>Stock</u></td>
              <td><u>Prod Cost (Res)</u></td>
              <td><u>Prod Time</u></td>
              <td><u>Sell Price (Gold)</u></td>
              <td><u>Produce</u></td>
            </tr>
            <tr>
              <td><img src="images/P_Red04.png" alt="" />{potion.name}</td>
              <td>{potion.description}</td>
              <td>{potion.count ?? 0}/{potion.maxCount ?? 0}</td>
              <td>{potion.cost ?? 0}</td>
              <td>{potion.prodTime ?? 0}</td>
              <td>{potion.sellPrice ?? 0}</td>
              <td>
                <button
                  type="button"
                  id="potionButt"
                  disabled={potionDisabled}
                  onClick={() => game.production.create(-1)}
                >
                  {potion.progress ?? 'Create Potion'}
                </button>
              </td>
            </tr>
            {potions.map((acc) => {
              const inProgress = acc.working > 0 || (acc.progress && /^\d+:\d+:\d+$/.test(String(acc.progress)));
              const disabled = inProgress || (acc.count + (acc.working || 0) >= (acc.maxCount || 0));
              return (
                <tr key={acc.id}>
                  <td><img src={`images/${acc.image}`} alt="" />{acc.name}</td>
                  <td>{acc.description}</td>
                  <td>{acc.count}/{acc.maxCount}</td>
                  <td>{acc.cost}</td>
                  <td>{acc.prodTime}</td>
                  <td>{acc.sellPrice}</td>
                  <td>
                    <button
                      type="button"
                      id={`p${acc.id}`}
                      disabled={disabled}
                      onClick={() => game.production.create(acc.id)}
                    >
                      {acc.progress ?? `Create ${acc.name}`}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {weapons.length > 0 && (
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td><b><u>{blacksmithName}</u></b></td>
              </tr>
              <tr>
                <td><u>Name</u></td>
                <td><u>Damage</u></td>
                <td><u>Requirement</u></td>
                <td><u>Durability</u></td>
                <td><u>Stock</u></td>
                <td><u>Prod Cost (Res)</u></td>
                <td><u>Prod Time</u></td>
                <td><u>Sell Price (Gold)</u></td>
                <td><u>Produce</u></td>
              </tr>
              {weapons.map((weapon) => {
                const inProgress = weapon.working > 0 || (weapon.progress && /^\d+:\d+:\d+$/.test(String(weapon.progress)));
                const disabled = inProgress || (weapon.count + (weapon.working || 0) >= (weapon.maxCount || 0));
                return (
                  <tr key={weapon.id}>
                    <td><img src={`images/${weapon.image}`} alt="" />{weapon.name}</td>
                    <td>{weapon.minDamage}-{weapon.maxDamage}</td>
                    <td>{(weapon.heroClass || []).map((c) => (state.heroClass || [])[c]?.name).filter(Boolean).join(', ') || '—'}</td>
                    <td>{weapon.durability}</td>
                    <td>{weapon.count}/{weapon.maxCount}</td>
                    <td>{weapon.cost}</td>
                    <td>{weapon.prodTime}</td>
                    <td>{Number(weapon.sellPrice).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        id={`w${weapon.id}`}
                        disabled={disabled}
                        onClick={() => game.production.purchaseWeapon(weapon.id)}
                      >
                        {weapon.progress ?? `Create ${weapon.name}`}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="col-lg-6" style={blueprints.length === 0 ? { display: 'none' } : undefined}>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <td><b><u>{marketName}</u></b></td>
            </tr>
            <tr>
              <td><u>Name</u></td>
              <td><u>Cost (gold)</u></td>
            </tr>
            {blueprints.map((blueprint) => (
              <tr key={blueprint.id ?? blueprint.name}>
                <td title={blueprint.description}>{blueprint.name}</td>
                <td>{Number(blueprint.cost).toLocaleString()}</td>
                <td>
                  <button
                    type="button"
                    title={blueprint.description}
                    onClick={() => game.production.incrBlueprint(blueprint)}
                  >
                    Buy {blueprint.name}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
